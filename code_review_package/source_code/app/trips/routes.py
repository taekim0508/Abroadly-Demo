from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..deps import current_user
from ..models import Trip, TripReview, User

router = APIRouter(prefix="/api/trips", tags=["trips"])


# ===== PYDANTIC SCHEMAS =====


class TripCreate(BaseModel):
    destination: str
    country: str
    description: Optional[str] = None
    trip_type: Optional[str] = None  # weekend, spring break, summer, etc.


class TripUpdate(BaseModel):
    destination: Optional[str] = None
    country: Optional[str] = None
    description: Optional[str] = None
    trip_type: Optional[str] = None


class TripReviewCreate(BaseModel):
    rating: int
    review_text: str


# ===== TRIP CRUD =====


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_trip(
    trip: TripCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a new trip."""
    db_trip = Trip(**trip.model_dump())
    session.add(db_trip)
    session.commit()
    session.refresh(db_trip)
    return db_trip


@router.get("/", response_model=List[Trip])
def list_trips(
    destination: Optional[str] = None,
    country: Optional[str] = None,
    trip_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    """List all trips with optional filters."""
    query = select(Trip)

    if destination:
        query = query.where(Trip.destination == destination)
    if country:
        query = query.where(Trip.country == country)
    if trip_type:
        query = query.where(Trip.trip_type == trip_type)

    query = query.offset(skip).limit(limit)
    trips = session.exec(query).all()
    return trips


@router.get("/{trip_id}")
def get_trip(trip_id: int, session: Session = Depends(get_session)):
    """Get a specific trip by ID."""
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")
    return trip


@router.put("/{trip_id}")
def update_trip(
    trip_id: int,
    trip_update: TripUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Update a trip."""
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    update_data = trip_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(trip, key, value)

    session.add(trip)
    session.commit()
    session.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(
    trip_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Delete a trip."""
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    session.delete(trip)
    session.commit()
    return None


# ===== TRIP REVIEWS =====


@router.post("/{trip_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_trip_review(
    trip_id: int,
    review: TripReviewCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a review for a trip."""
    # Check if trip exists
    trip = session.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    db_review = TripReview(user_id=user.id, trip_id=trip_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review


@router.get("/{trip_id}/reviews")
def list_trip_reviews(
    trip_id: int, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    """List all reviews for a specific trip."""
    query = select(TripReview).where(TripReview.trip_id == trip_id).offset(skip).limit(limit)
    reviews = session.exec(query).all()
    return reviews
