# Contributors:
# Cursor AI Assistant - AI Trip Planner feature

import logging
import os
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from openai import OpenAI
from pydantic import BaseModel
from sqlmodel import Session, select

from app.db import get_session
from app.deps import current_user

logger = logging.getLogger(__name__)
from app.models import (
    Place,
    PlaceBookmark,
    PlaceReview,
    ProgramBookmark,
    ProgramReview,
    StudyAbroadProgram,
    Trip,
    TripBookmark,
    TripReview,
    User,
)

router = APIRouter(prefix="/ai", tags=["ai"])


class TripPlanRequest(BaseModel):
    """Request model for AI trip planning."""

    travel_start_date: Optional[str] = None  # ISO date string
    travel_end_date: Optional[str] = None  # ISO date string
    budget: Optional[str] = None  # e.g., "low", "medium", "high"
    travel_style: Optional[str] = None  # e.g., "adventure", "relaxed", "cultural"
    priorities: Optional[list[str]] = None  # e.g., ["food", "sightseeing", "nightlife"]
    additional_notes: Optional[str] = None


def get_season_context(date_str: Optional[str]) -> str:
    """Get season and weather context based on date."""
    if not date_str:
        # Default to current date
        month = datetime.now().month
    else:
        try:
            month = datetime.fromisoformat(date_str).month
        except ValueError:
            month = datetime.now().month

    if month in [12, 1, 2]:
        return (
            "winter (December-February) - expect cold weather in the "
            "Northern Hemisphere, summer in the Southern Hemisphere"
        )
    elif month in [3, 4, 5]:
        return "spring (March-May) - mild weather, shoulder season for travel"
    elif month in [6, 7, 8]:
        return (
            "summer (June-August) - warm weather in the Northern Hemisphere, "
            "winter in the Southern Hemisphere"
        )
    else:
        return "fall/autumn (September-November) - cooling weather, great for outdoor activities"


def format_bookmarks_for_prompt(
    programs: list[dict],
    places: list[dict],
    trips: list[dict],
    program_reviews: dict,
    place_reviews: dict,
    trip_reviews: dict,
) -> str:
    """Format bookmarked items with reviews for the AI prompt."""
    sections = []

    if programs:
        program_text = "## User's Current Study Abroad Location(s) - Their Home Base:\n"
        program_text += "(Plan trips FROM these locations, not TO them)\n"
        for p in programs:
            program_text += f"\n### {p['program_name']}\n"
            program_text += f"- Institution: {p.get('institution', 'N/A')}\n"
            program_text += f"- Location: {p.get('city', 'N/A')}, {p.get('country', 'N/A')}\n"
            program_text += f"- Duration: {p.get('duration', 'N/A')}\n"
            program_text += f"- Cost: ${p.get('cost', 'N/A')}\n"
            if p.get("description"):
                program_text += f"- Description: {p['description'][:200]}...\n"

            # Add reviews
            pid = p["id"]
            if pid in program_reviews and program_reviews[pid]:
                program_text += "- Student Reviews:\n"
                for review in program_reviews[pid][:3]:  # Top 3 reviews
                    program_text += (
                        f'  * Rating: {review["rating"]}/5 - "{review["text"][:150]}..."\n'
                    )
        sections.append(program_text)

    if places:
        places_text = "## Bookmarked Places to Visit (Destinations):\n"
        for p in places:
            places_text += f"\n### {p['name']}\n"
            places_text += f"- Category: {p.get('category', 'N/A')}\n"
            places_text += f"- Location: {p.get('city', 'N/A')}, {p.get('country', 'N/A')}\n"
            if p.get("address"):
                places_text += f"- Address: {p['address']}\n"
            if p.get("description"):
                places_text += f"- Description: {p['description'][:200]}...\n"

            # Add reviews
            pid = p["id"]
            if pid in place_reviews and place_reviews[pid]:
                places_text += "- Reviews:\n"
                for review in place_reviews[pid][:3]:
                    places_text += (
                        f'  * Rating: {review["rating"]}/5 - "{review["text"][:150]}..."\n'
                    )
        sections.append(places_text)

    if trips:
        trips_text = "## Bookmarked Trip Destinations:\n"
        for t in trips:
            trips_text += f"\n### {t['destination']}\n"
            trips_text += f"- Country: {t.get('country', 'N/A')}\n"
            trips_text += f"- Trip Type: {t.get('trip_type', 'N/A')}\n"
            if t.get("description"):
                trips_text += f"- Description: {t['description'][:200]}...\n"

            # Add reviews
            tid = t["id"]
            if tid in trip_reviews and trip_reviews[tid]:
                trips_text += "- Reviews:\n"
                for review in trip_reviews[tid][:3]:
                    trips_text += (
                        f'  * Rating: {review["rating"]}/5 - "{review["text"][:150]}..."\n'
                    )
        sections.append(trips_text)

    return "\n\n".join(sections) if sections else "No bookmarked items found."


def build_system_prompt() -> str:
    """Build the system prompt for the AI trip planner."""
    return """You are an expert travel planner specializing in study abroad \
experiences. You help students plan amazing trips based on their bookmarked \
programs, places, and trips.

IMPORTANT CONTEXT:
- The user's bookmarked PROGRAMS represent where they are CURRENTLY STUDYING \
ABROAD (their home base/current location)
- Do NOT plan trips TO the program locations - the user is already there!
- Instead, plan trips FROM the program locations to the bookmarked places
- Consider travel logistics from their program city (flights, trains, buses)

Your role is to:
1. Analyze the user's bookmarked items and their reviews
2. Use their program location as the starting point for travel
3. Consider the travel dates, season, and weather implications
4. Create a personalized, day-by-day itinerary from their program city
5. Incorporate insights from reviews (what students loved, tips, warnings)
6. Balance activities with rest time
7. Consider budget constraints if mentioned
8. Suggest the best times to visit specific places based on reviews
9. Include practical travel tips for getting to destinations

Format your response as a well-structured travel plan with:
- An exciting overview/summary
- Day-by-day itinerary with specific recommendations
- Transportation suggestions from their program city
- Tips based on student reviews
- Budget considerations (including travel costs from program location)
- Packing suggestions based on season/activities
- Any warnings or things to watch out for

Be enthusiastic, helpful, and include specific details from the reviews to \
make recommendations feel personal and authentic. Use emojis sparingly."""


@router.post("/plan-trip")
async def plan_trip(
    request: TripPlanRequest,
    http_request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_session),
):
    """Generate an AI-powered trip plan based on user's bookmarks."""
    # Temporary logging to debug auth issues
    auth_header = http_request.headers.get("Authorization")
    cookie = http_request.cookies.get("abroadly_session")
    logger.info(f"POST /ai/plan-trip - Auth header present: {auth_header is not None}, Cookie present: {cookie is not None}")
    if auth_header:
        logger.info(f"Authorization header: {auth_header[:20]}...")
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Please add OPENAI_API_KEY to your environment.",
        )

    # Fetch all bookmarks
    program_bookmarks = db.exec(
        select(ProgramBookmark).where(ProgramBookmark.user_id == user.id)
    ).all()
    place_bookmarks = db.exec(select(PlaceBookmark).where(PlaceBookmark.user_id == user.id)).all()
    trip_bookmarks = db.exec(select(TripBookmark).where(TripBookmark.user_id == user.id)).all()

    # Fetch full objects
    programs = []
    program_reviews = {}
    for bookmark in program_bookmarks:
        program = db.get(StudyAbroadProgram, bookmark.program_id)
        if program:
            programs.append(
                {
                    "id": program.id,
                    "program_name": program.program_name,
                    "institution": program.institution,
                    "city": program.city,
                    "country": program.country,
                    "cost": program.cost,
                    "duration": program.duration,
                    "description": program.description,
                }
            )
            # Fetch reviews
            reviews = db.exec(
                select(ProgramReview).where(ProgramReview.program_id == program.id)
            ).all()
            program_reviews[program.id] = [
                {"rating": r.rating, "text": r.review_text or ""} for r in reviews
            ]

    places = []
    place_reviews = {}
    for bookmark in place_bookmarks:
        place = db.get(Place, bookmark.place_id)
        if place:
            places.append(
                {
                    "id": place.id,
                    "name": place.name,
                    "category": place.category,
                    "city": place.city,
                    "country": place.country,
                    "address": place.address,
                    "description": place.description,
                }
            )
            # Fetch reviews
            reviews = db.exec(select(PlaceReview).where(PlaceReview.place_id == place.id)).all()
            place_reviews[place.id] = [
                {"rating": r.rating, "text": r.review_text or ""} for r in reviews
            ]

    trips = []
    trip_reviews_data = {}
    for bookmark in trip_bookmarks:
        trip = db.get(Trip, bookmark.trip_id)
        if trip:
            trips.append(
                {
                    "id": trip.id,
                    "destination": trip.destination,
                    "country": trip.country,
                    "trip_type": trip.trip_type,
                    "description": trip.description,
                }
            )
            # Fetch reviews
            reviews = db.exec(select(TripReview).where(TripReview.trip_id == trip.id)).all()
            trip_reviews_data[trip.id] = [
                {"rating": r.rating, "text": r.review_text or ""} for r in reviews
            ]

    if not programs and not places and not trips:
        raise HTTPException(
            status_code=400,
            detail="You need to bookmark some programs, places, or trips first!",
        )

    # Build the prompt
    bookmarks_context = format_bookmarks_for_prompt(
        programs, places, trips, program_reviews, place_reviews, trip_reviews_data
    )

    season_context = get_season_context(request.travel_start_date)

    user_context = f"""
## User's Travel Preferences:
- Travel Dates: {request.travel_start_date or "Flexible"} to {request.travel_end_date or "Flexible"}
- Season: {season_context}
- Budget Level: {request.budget or "Not specified"}
- Travel Style: {request.travel_style or "Not specified"}
- Priorities: {", ".join(request.priorities) if request.priorities else "Not specified"}
- Additional Notes: {request.additional_notes or "None"}

## User's Name: {user.first_name or "Traveler"}
"""

    full_prompt = f"""Based on the following bookmarked items and preferences, \
create an amazing personalized travel plan!

{bookmarks_context}

{user_context}

REMEMBER: The user is currently studying abroad at their bookmarked program \
location(s). Plan trips FROM their program city TO the bookmarked places and \
trip destinations. Include practical transportation suggestions.

Please create a detailed, day-by-day travel itinerary that makes the most of \
these bookmarked destinations. Reference specific reviews to explain why \
you're recommending certain activities or places. Make it personal!"""

    # Call OpenAI
    client = OpenAI(api_key=api_key)

    async def generate():
        """Stream the response from OpenAI."""
        try:
            stream = client.chat.completions.create(
                model="gpt-4o-mini",  # Cost-effective and capable
                messages=[
                    {"role": "system", "content": build_system_prompt()},
                    {"role": "user", "content": full_prompt},
                ],
                stream=True,
                max_tokens=2000,
                temperature=0.8,  # Slightly creative
            )

            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content

        except Exception as e:
            yield f"\n\nError generating trip plan: {str(e)}"

    return StreamingResponse(generate(), media_type="text/plain")


@router.post("/quick-suggestion")
async def quick_suggestion(
    http_request: Request,
    user: User = Depends(current_user),
    db: Session = Depends(get_session),
):
    # Temporary logging to debug auth issues
    auth_header = http_request.headers.get("Authorization")
    cookie = http_request.cookies.get("abroadly_session")
    logger.info(f"POST /ai/quick-suggestion - Auth header present: {auth_header is not None}, Cookie present: {cookie is not None}")
    """Get a quick AI suggestion based on current bookmarks and time of year."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Please add OPENAI_API_KEY to your environment.",
        )

    # Fetch bookmark counts
    program_count = len(
        db.exec(select(ProgramBookmark).where(ProgramBookmark.user_id == user.id)).all()
    )
    place_count = len(db.exec(select(PlaceBookmark).where(PlaceBookmark.user_id == user.id)).all())
    trip_count = len(db.exec(select(TripBookmark).where(TripBookmark.user_id == user.id)).all())

    total = program_count + place_count + trip_count
    if total == 0:
        return {
            "suggestion": (
                "Start by bookmarking some programs, places, or trips that "
                "interest you! Once you have some saved, I can help you plan "
                "an amazing adventure. 🌍"
            )
        }

    season = get_season_context(None)

    client = OpenAI(api_key=api_key)

    user_prompt = (
        f"The user has {program_count} programs, {place_count} places, "
        f"and {trip_count} trips bookmarked. It's currently {season}. "
        "Give them a brief, exciting suggestion about planning their trip "
        "(max 2 sentences)."
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a friendly travel advisor. "
                    "Give a brief, encouraging one-liner suggestion."
                ),
            },
            {
                "role": "user",
                "content": user_prompt,
            },
        ],
        max_tokens=100,
        temperature=0.9,
    )

    return {"suggestion": response.choices[0].message.content}
