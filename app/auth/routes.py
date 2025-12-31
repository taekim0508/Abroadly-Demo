# Contributors:
# Lucas Slater: Setup and route writing (1 hr)
# Trey Fisher: Route writing (1 hr)

import logging
from typing import Dict, List, Optional

import resend
from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from ..config import settings
from ..db import get_session
from ..deps import current_user
from ..models import (
    CourseReview,
    Place,
    PlaceReview,
    ProgramHousingReview,
    ProgramReview,
    StudyAbroadProgram,
    Trip,
    TripReview,
    User,
)
from .jwt import mint_jwt
from .magic import make_magic_token, verify_magic_token

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])


class RequestLinkBody(BaseModel):
    email: EmailStr


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    institution: Optional[str] = None
    majors: Optional[List[str]] = None
    minors: Optional[List[str]] = None
    profile_completed: Optional[bool] = None
    # Study abroad status fields
    study_abroad_status: Optional[str] = None  # "prospective", "current", "former"
    program_name: Optional[str] = None
    program_city: Optional[str] = None
    program_country: Optional[str] = None
    program_term: Optional[str] = None
    onboarding_completed: Optional[bool] = None


@router.post("/request-link")
def request_link(body: RequestLinkBody) -> Dict[str, str]:
    email = body.email.lower()
    domain = email.split("@")[-1]

    # Only allow approved email domains
    if domain not in settings.allowed_email_domains:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Email domain not allowed. "
                f"Please use one of: {', '.join(settings.allowed_email_domains)}"
            ),
        )

    token = make_magic_token(email)
    # Point to frontend auth page instead of backend callback
    # Use frontend_url_for_links which automatically detects localhost vs production
    frontend_url = settings.frontend_url_for_links
    magic_url = f"{frontend_url}/auth?token={token}"

    # Log the magic URL for debugging
    logger.info(f"Generated magic link for {email}: {magic_url}")

    # In development, return the link directly
    if not (settings.resend_api_key and settings.email_from):
        logger.warning("No email configuration found, returning magic link directly")
        return {"magic_link": magic_url}

    # Send email
    try:
        resend.api_key = settings.resend_api_key

        email_html = f"""  
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ 
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                }}
                .container {{ 
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: white;
                }}
                .logo {{ 
                    text-align: center;
                    padding: 20px 0;
                    border-bottom: 2px solid #f0f0f0;
                }}
                .logo h1 {{
                    margin: 0;
                    font-size: 32px;
                    color: #2563eb;
                    font-weight: bold;
                }}
                .logo .tagline {{ color: #666; font-size: 14px; margin-top: 5px; }}
                .content {{ padding: 30px 20px; }}
                .button {{
                    display: inline-block;
                    padding: 12px 24px;
                    background-color: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                    font-weight: bold;
                }}
                .button:hover {{ background-color: #1d4ed8; }}
                .footer {{
                    margin-top: 30px;
                    font-size: 12px;
                    color: #666;
                    border-top: 1px solid #f0f0f0;
                    padding-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>✈️ Abroadly</h1>
                    <div class="tagline">Your Study Abroad Companion</div>
                </div>
                
                <div class="content">
                    <h2>Welcome to Abroadly!</h2>
                    <p>Click the button below to sign in to your account:</p>
                    <a href="{magic_url}" class="button">Sign In to Abroadly</a>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="word-break: break-all; color: #666;">{magic_url}</p>
                </div>
                
                <div class="footer">
                    <p>This link will expire in 15 minutes.</p>
                    <p>If you didn't request this email, you can safely ignore it.</p>
                    <p style="color: #999; margin-top: 10px;">
                        © 2024 Abroadly. All rights reserved.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        result = resend.Emails.send(
            {
                "from": settings.email_from,
                "to": [email],
                "subject": "Your Abroadly sign-in link",
                "html": email_html,
                "text": (
                    f"Click to sign in to Abroadly: {magic_url}\n\n"
                    "This link will expire in 15 minutes."
                ),
            }
        )
        logger.info(f"Email sent successfully to {email}, result: {result}")
        return {"sent": "email"}
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send email: {str(e)}",
        )


@router.get("/callback")
def callback(token: str, response: Response):
    email = verify_magic_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    from sqlmodel import select

    with next(get_session()) as session:
        existing = session.exec(select(User).where(User.email == email)).first()
        if existing:
            user = existing
        else:
            user = User(email=email)
            session.add(user)
            session.commit()
            session.refresh(user)

    jwt_token = mint_jwt(int(user.id), email)
    # Determine if we're in production (HTTPS) for secure cookies
    is_production = settings.app_url.startswith("https://")
    # For cross-origin requests (different domains), we need SameSite=None with Secure=True
    # For same-origin (localhost dev), we can use SameSite=Lax
    if is_production:
        # Production: cross-origin, so use None with Secure
        response.set_cookie(
            key=settings.cookie_name,
            value=jwt_token,
            httponly=True,
            samesite="none",
            secure=True,  # Required when SameSite=None
        )
    else:
        # Development: same-origin, so use Lax
        response.set_cookie(
            key=settings.cookie_name,
            value=jwt_token,
            httponly=True,
            samesite="lax",
            secure=False,
        )
    return {"ok": True}


@router.get("/me")
def me(user=Depends(current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "age": user.age,
        "institution": user.institution,
        "majors": user.majors or [],
        "minors": user.minors or [],
        "profile_completed": user.profile_completed,
        "study_abroad_status": user.study_abroad_status,
        "program_name": user.program_name,
        "program_city": user.program_city,
        "program_country": user.program_country,
        "program_term": user.program_term,
        "onboarding_completed": user.onboarding_completed,
    }


@router.get("/profile")
def get_profile(user=Depends(current_user)):
    """Get current user's profile"""
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "age": user.age,
        "institution": user.institution,
        "majors": user.majors or [],
        "minors": user.minors or [],
        "profile_completed": user.profile_completed,
        "study_abroad_status": user.study_abroad_status,
        "program_name": user.program_name,
        "program_city": user.program_city,
        "program_country": user.program_country,
        "program_term": user.program_term,
        "onboarding_completed": user.onboarding_completed,
    }


@router.get("/users/{user_id}/profile")
def get_public_profile(user_id: int, session: Session = Depends(get_session)):
    """Get a user's public profile (for viewing other users)"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Return public info only (no email, age, etc.)
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "institution": user.institution,
        "majors": user.majors or [],
        "minors": user.minors or [],
        "study_abroad_status": user.study_abroad_status,
        "program_name": user.program_name,
        "program_city": user.program_city,
        "program_country": user.program_country,
        "program_term": user.program_term,
    }


@router.get("/users/{user_id}/reviews")
def get_user_reviews(user_id: int, session: Session = Depends(get_session)):
    """Get all reviews by a specific user"""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Get program reviews
    program_reviews_query = select(ProgramReview).where(ProgramReview.user_id == user_id)
    program_reviews = session.exec(program_reviews_query).all()

    # Enrich with program info
    enriched_program_reviews = []
    for review in program_reviews:
        program = session.get(StudyAbroadProgram, review.program_id)
        enriched_program_reviews.append(
            {
                "id": review.id,
                "type": "program",
                "rating": review.rating,
                "review_text": review.review_text,
                "date": review.date,
                "program_id": review.program_id,
                "program_name": program.program_name if program else None,
                "program_city": program.city if program else None,
                "program_country": program.country if program else None,
            }
        )

    # Get place reviews
    place_reviews_query = select(PlaceReview).where(PlaceReview.user_id == user_id)
    place_reviews = session.exec(place_reviews_query).all()

    enriched_place_reviews = []
    for review in place_reviews:
        place = session.get(Place, review.place_id)
        enriched_place_reviews.append(
            {
                "id": review.id,
                "type": "place",
                "rating": review.rating,
                "review_text": review.review_text,
                "date": review.date,
                "place_id": review.place_id,
                "place_name": place.name if place else None,
                "place_city": place.city if place else None,
                "place_country": place.country if place else None,
            }
        )

    # Get trip reviews
    trip_reviews_query = select(TripReview).where(TripReview.user_id == user_id)
    trip_reviews = session.exec(trip_reviews_query).all()

    enriched_trip_reviews = []
    for review in trip_reviews:
        trip = session.get(Trip, review.trip_id)
        enriched_trip_reviews.append(
            {
                "id": review.id,
                "type": "trip",
                "rating": review.rating,
                "review_text": review.review_text,
                "date": review.date,
                "trip_id": review.trip_id,
                "trip_destination": trip.destination if trip else None,
                "trip_country": trip.country if trip else None,
            }
        )

    return {
        "program_reviews": enriched_program_reviews,
        "place_reviews": enriched_place_reviews,
        "trip_reviews": enriched_trip_reviews,
    }


@router.put("/profile")
def update_profile(profile_data: ProfileUpdate, user=Depends(current_user)):
    """Update user profile (for onboarding questionnaire)"""
    with next(get_session()) as session:
        # Get the user from database
        db_user = session.get(User, user.id)
        if not db_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Update fields if provided
        if profile_data.first_name is not None:
            db_user.first_name = profile_data.first_name
        if profile_data.last_name is not None:
            db_user.last_name = profile_data.last_name
        if profile_data.age is not None:
            db_user.age = profile_data.age
        if profile_data.institution is not None:
            db_user.institution = profile_data.institution
        if profile_data.majors is not None:
            db_user.majors = profile_data.majors
        if profile_data.minors is not None:
            db_user.minors = profile_data.minors
        if profile_data.profile_completed is not None:
            db_user.profile_completed = profile_data.profile_completed
        # Study abroad status fields
        if profile_data.study_abroad_status is not None:
            db_user.study_abroad_status = profile_data.study_abroad_status
        if profile_data.program_name is not None:
            db_user.program_name = profile_data.program_name
        if profile_data.program_city is not None:
            db_user.program_city = profile_data.program_city
        if profile_data.program_country is not None:
            db_user.program_country = profile_data.program_country
        if profile_data.program_term is not None:
            db_user.program_term = profile_data.program_term
        if profile_data.onboarding_completed is not None:
            db_user.onboarding_completed = profile_data.onboarding_completed

        session.add(db_user)
        session.commit()
        session.refresh(db_user)

        return {
            "id": db_user.id,
            "email": db_user.email,
            "first_name": db_user.first_name,
            "last_name": db_user.last_name,
            "age": db_user.age,
            "institution": db_user.institution,
            "majors": db_user.majors or [],
            "minors": db_user.minors or [],
            "profile_completed": db_user.profile_completed,
            "study_abroad_status": db_user.study_abroad_status,
            "program_name": db_user.program_name,
            "program_city": db_user.program_city,
            "program_country": db_user.program_country,
            "program_term": db_user.program_term,
            "onboarding_completed": db_user.onboarding_completed,
        }


@router.get("/my-reviews")
def get_my_reviews(user=Depends(current_user)):
    """Get all reviews by the current user"""
    with next(get_session()) as session:
        # Get all review types
        program_reviews = session.exec(
            select(ProgramReview).where(ProgramReview.user_id == user.id)
        ).all()
        course_reviews = session.exec(
            select(CourseReview).where(CourseReview.user_id == user.id)
        ).all()
        housing_reviews = session.exec(
            select(ProgramHousingReview).where(ProgramHousingReview.user_id == user.id)
        ).all()
        place_reviews = session.exec(
            select(PlaceReview).where(PlaceReview.user_id == user.id)
        ).all()
        trip_reviews = session.exec(select(TripReview).where(TripReview.user_id == user.id)).all()

        return {
            "program_reviews": [
                {
                    "id": r.id,
                    "program_id": r.program_id,
                    "rating": r.rating,
                    "review_text": r.review_text,
                    "date": r.date.isoformat(),
                }
                for r in program_reviews
            ],
            "course_reviews": [
                {
                    "id": r.id,
                    "program_id": r.program_id,
                    "course_name": r.course_name,
                    "instructor_name": r.instructor_name,
                    "rating": r.rating,
                    "review_text": r.review_text,
                    "date": r.date.isoformat(),
                }
                for r in course_reviews
            ],
            "housing_reviews": [
                {
                    "id": r.id,
                    "program_id": r.program_id,
                    "housing_description": r.housing_description,
                    "rating": r.rating,
                    "review_text": r.review_text,
                    "date": r.date.isoformat(),
                }
                for r in housing_reviews
            ],
            "place_reviews": [
                {
                    "id": r.id,
                    "place_id": r.place_id,
                    "rating": r.rating,
                    "review_text": r.review_text,
                    "date": r.date.isoformat(),
                }
                for r in place_reviews
            ],
            "trip_reviews": [
                {
                    "id": r.id,
                    "trip_id": r.trip_id,
                    "rating": r.rating,
                    "review_text": r.review_text,
                    "date": r.date.isoformat(),
                }
                for r in trip_reviews
            ],
        }


@router.delete("/my-reviews/{review_type}/{review_id}")
def delete_my_review(review_type: str, review_id: int, user=Depends(current_user)):
    """Delete a review by the current user"""
    with next(get_session()) as session:
        # Map review types to models
        review_models = {
            "program": ProgramReview,
            "course": CourseReview,
            "housing": ProgramHousingReview,
            "place": PlaceReview,
            "trip": TripReview,
        }

        if review_type not in review_models:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid review type. Must be one of: {list(review_models.keys())}",
            )

        ReviewModel = review_models[review_type]
        review = session.get(ReviewModel, review_id)

        if not review:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

        # Verify the review belongs to the current user
        if review.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only delete your own reviews",
            )

        session.delete(review)
        session.commit()

        return {"ok": True, "message": "Review deleted successfully"}


@router.get("/my-trips")
def get_my_trips(user=Depends(current_user)):
    """Get all trips posted by the current user"""
    with next(get_session()) as session:
        trips = session.exec(select(Trip).where(Trip.user_id == user.id)).all()
        return [
            {
                "id": t.id,
                "destination": t.destination,
                "country": t.country,
                "description": t.description,
                "trip_type": t.trip_type,
                "created_at": t.created_at.isoformat(),
            }
            for t in trips
        ]


@router.get("/my-programs")
def get_my_programs(user=Depends(current_user)):
    """Get all programs posted by the current user"""
    with next(get_session()) as session:
        programs = session.exec(
            select(StudyAbroadProgram).where(StudyAbroadProgram.user_id == user.id)
        ).all()
        return programs


@router.get("/my-places")
def get_my_places(user=Depends(current_user)):
    """Get all places posted by the current user"""
    with next(get_session()) as session:
        places = session.exec(select(Place).where(Place.user_id == user.id)).all()
        return places


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(settings.cookie_name)
    return {"ok": True}
