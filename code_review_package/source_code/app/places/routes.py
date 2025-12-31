from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..deps import current_user
from ..models import Place, PlaceReview, User

router = APIRouter(prefix="/api/places", tags=["places"])


# ===== PYDANTIC SCHEMAS =====


class PlaceCreate(BaseModel):
    name: str
    category: str  # restaurant, activity, museum, housing, etc.
    city: str
    country: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    description: Optional[str] = None


class PlaceUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    description: Optional[str] = None


class PlaceReviewCreate(BaseModel):
    rating: int
    review_text: str


# ===== PLACE CRUD =====


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_place(
    place: PlaceCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a new place (restaurant, activity, housing, etc.)."""
    db_place = Place(**place.model_dump())
    session.add(db_place)
    session.commit()
    session.refresh(db_place)
    return db_place


@router.get("/", response_model=List[Place])
def list_places(
    city: Optional[str] = None,
    country: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    """List all places with optional filters."""
    query = select(Place)

    if city:
        query = query.where(Place.city == city)
    if country:
        query = query.where(Place.country == country)
    if category:
        query = query.where(Place.category == category)

    query = query.offset(skip).limit(limit)
    places = session.exec(query).all()
    return places


@router.get("/{place_id}")
def get_place(place_id: int, session: Session = Depends(get_session)):
    """Get a specific place by ID."""
    place = session.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")
    return place


@router.put("/{place_id}")
def update_place(
    place_id: int,
    place_update: PlaceUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Update a place."""
    place = session.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")

    update_data = place_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(place, key, value)

    session.add(place)
    session.commit()
    session.refresh(place)
    return place


@router.delete("/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_place(
    place_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Delete a place."""
    place = session.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")

    session.delete(place)
    session.commit()
    return None


# ===== PLACE REVIEWS =====


@router.post("/{place_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_place_review(
    place_id: int,
    review: PlaceReviewCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a review for a place."""
    # Check if place exists
    place = session.get(Place, place_id)
    if not place:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Place not found")

    db_review = PlaceReview(user_id=user.id, place_id=place_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review


@router.get("/{place_id}/reviews")
def list_place_reviews(
    place_id: int, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    """List all reviews for a specific place."""
    query = select(PlaceReview).where(PlaceReview.place_id == place_id).offset(skip).limit(limit)
    reviews = session.exec(query).all()
    return reviews
