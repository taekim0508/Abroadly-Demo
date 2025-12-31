# Contributors:
# Cursor AI Assistant - Bookmarks feature implementation

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.db import get_session
from app.deps import current_user
from app.models import (
    Place,
    PlaceBookmark,
    ProgramBookmark,
    StudyAbroadProgram,
    Trip,
    TripBookmark,
)

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])


def get_user_id(user=Depends(current_user)) -> int:
    """Extract user ID from the current user object."""
    return user.id


# ===== PROGRAM BOOKMARKS =====


@router.post("/programs/{program_id}")
def bookmark_program(
    program_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Bookmark a study abroad program."""
    # Check if program exists
    program = db.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    # Check if already bookmarked
    existing = db.exec(
        select(ProgramBookmark).where(
            ProgramBookmark.user_id == user_id,
            ProgramBookmark.program_id == program_id,
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Program already bookmarked")

    # Create bookmark
    bookmark = ProgramBookmark(user_id=user_id, program_id=program_id)
    db.add(bookmark)
    try:
        db.commit()
        db.refresh(bookmark)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Program already bookmarked")

    return {"message": "Program bookmarked successfully", "bookmark_id": bookmark.id}


@router.delete("/programs/{program_id}")
def unbookmark_program(
    program_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Remove a program bookmark."""
    bookmark = db.exec(
        select(ProgramBookmark).where(
            ProgramBookmark.user_id == user_id,
            ProgramBookmark.program_id == program_id,
        )
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"message": "Program bookmark removed"}


@router.get("/programs")
def get_bookmarked_programs(
    user_id: int = Depends(get_user_id), db: Session = Depends(get_session)
):
    """Get all bookmarked programs for the current user."""
    bookmarks = db.exec(select(ProgramBookmark).where(ProgramBookmark.user_id == user_id)).all()

    # Fetch the actual programs
    programs = []
    for bookmark in bookmarks:
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
                    "bookmarked_at": bookmark.created_at.isoformat(),
                }
            )

    return programs


# ===== PLACE BOOKMARKS =====


@router.post("/places/{place_id}")
def bookmark_place(
    place_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Bookmark a place."""
    # Check if place exists
    place = db.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")

    # Check if already bookmarked
    existing = db.exec(
        select(PlaceBookmark).where(
            PlaceBookmark.user_id == user_id, PlaceBookmark.place_id == place_id
        )
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Place already bookmarked")

    # Create bookmark
    bookmark = PlaceBookmark(user_id=user_id, place_id=place_id)
    db.add(bookmark)
    try:
        db.commit()
        db.refresh(bookmark)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Place already bookmarked")

    return {"message": "Place bookmarked successfully", "bookmark_id": bookmark.id}


@router.delete("/places/{place_id}")
def unbookmark_place(
    place_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Remove a place bookmark."""
    bookmark = db.exec(
        select(PlaceBookmark).where(
            PlaceBookmark.user_id == user_id, PlaceBookmark.place_id == place_id
        )
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"message": "Place bookmark removed"}


@router.get("/places")
def get_bookmarked_places(user_id: int = Depends(get_user_id), db: Session = Depends(get_session)):
    """Get all bookmarked places for the current user."""
    bookmarks = db.exec(select(PlaceBookmark).where(PlaceBookmark.user_id == user_id)).all()

    # Fetch the actual places
    places = []
    for bookmark in bookmarks:
        place = db.get(Place, bookmark.place_id)
        if place:
            places.append(
                {
                    "id": place.id,
                    "name": place.name,
                    "category": place.category,
                    "city": place.city,
                    "country": place.country,
                    "description": place.description,
                    "address": place.address,
                    "bookmarked_at": bookmark.created_at.isoformat(),
                }
            )

    return places


# ===== TRIP BOOKMARKS =====


@router.post("/trips/{trip_id}")
def bookmark_trip(
    trip_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Bookmark a trip."""
    # Check if trip exists
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    # Check if already bookmarked
    existing = db.exec(
        select(TripBookmark).where(TripBookmark.user_id == user_id, TripBookmark.trip_id == trip_id)
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Trip already bookmarked")

    # Create bookmark
    bookmark = TripBookmark(user_id=user_id, trip_id=trip_id)
    db.add(bookmark)
    try:
        db.commit()
        db.refresh(bookmark)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Trip already bookmarked")

    return {"message": "Trip bookmarked successfully", "bookmark_id": bookmark.id}


@router.delete("/trips/{trip_id}")
def unbookmark_trip(
    trip_id: int,
    user_id: int = Depends(get_user_id),
    db: Session = Depends(get_session),
):
    """Remove a trip bookmark."""
    bookmark = db.exec(
        select(TripBookmark).where(TripBookmark.user_id == user_id, TripBookmark.trip_id == trip_id)
    ).first()

    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")

    db.delete(bookmark)
    db.commit()
    return {"message": "Trip bookmark removed"}


@router.get("/trips")
def get_bookmarked_trips(user_id: int = Depends(get_user_id), db: Session = Depends(get_session)):
    """Get all bookmarked trips for the current user."""
    bookmarks = db.exec(select(TripBookmark).where(TripBookmark.user_id == user_id)).all()

    # Fetch the actual trips
    trips = []
    for bookmark in bookmarks:
        trip = db.get(Trip, bookmark.trip_id)
        if trip:
            trips.append(
                {
                    "id": trip.id,
                    "destination": trip.destination,
                    "country": trip.country,
                    "description": trip.description,
                    "trip_type": trip.trip_type,
                    "bookmarked_at": bookmark.created_at.isoformat(),
                }
            )

    return trips


# ===== GET ALL BOOKMARKS =====


@router.get("")
def get_all_bookmarks(user_id: int = Depends(get_user_id), db: Session = Depends(get_session)):
    """Get all bookmarks for the current user (programs, places, trips)."""
    try:
        # Fetch all bookmark types
        program_bookmarks = db.exec(
            select(ProgramBookmark).where(ProgramBookmark.user_id == user_id)
        ).all()
        place_bookmarks = db.exec(
            select(PlaceBookmark).where(PlaceBookmark.user_id == user_id)
        ).all()
        trip_bookmarks = db.exec(select(TripBookmark).where(TripBookmark.user_id == user_id)).all()

        # Build response with full objects
        programs = []
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
                        "housing_type": program.housing_type,
                        "location": program.location,
                        "created_at": program.created_at.isoformat()
                        if program.created_at
                        else None,
                    }
                )

        places = []
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
                        "description": place.description,
                        "address": place.address,
                        "latitude": place.latitude,
                        "longitude": place.longitude,
                        "created_at": place.created_at.isoformat() if place.created_at else None,
                    }
                )

        trips = []
        for bookmark in trip_bookmarks:
            trip = db.get(Trip, bookmark.trip_id)
            if trip:
                trips.append(
                    {
                        "id": trip.id,
                        "destination": trip.destination,
                        "country": trip.country,
                        "description": trip.description,
                        "trip_type": trip.trip_type,
                        "created_at": trip.created_at.isoformat() if trip.created_at else None,
                    }
                )

        return {"programs": programs, "places": places, "trips": trips}
    except Exception as e:
        # Log the error and return empty bookmarks to avoid 500 errors
        import logging

        logging.error(f"Error fetching bookmarks: {e}")
        return {"programs": [], "places": [], "trips": []}
