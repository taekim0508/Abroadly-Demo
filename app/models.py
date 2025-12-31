# Contributors:
# Lucas Slater: Setup and model writing (1.5 hrs)
# Trey Fisher: Setup and model writing (1.5 hrs)

from datetime import datetime
from typing import List, Optional

import sqlalchemy as sa
from sqlalchemy.types import JSON
from sqlmodel import Column, Field, SQLModel

# ===== USER =====


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(sa_column=sa.Column(sa.String, unique=True, index=True))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Profile fields
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    age: Optional[int] = None
    institution: Optional[str] = None
    majors: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    minors: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    profile_completed: bool = Field(default=False)

    # Study abroad status fields
    study_abroad_status: Optional[str] = None  # "prospective", "current", "former"
    program_name: Optional[str] = None  # Name of program attended (for current/former)
    program_city: Optional[str] = None
    program_country: Optional[str] = None
    program_term: Optional[str] = None  # e.g., "Fall 2024", "Spring 2025"
    onboarding_completed: bool = Field(default=False)  # Track if they've done onboarding


# ===== PROGRAM ECOSYSTEM (For Prospective Students) =====


class StudyAbroadProgram(SQLModel, table=True):
    __tablename__ = "study_abroad_program"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", index=True
    )  # Track who posted the program
    program_name: str = Field(index=True)
    institution: str
    city: str = Field(index=True)
    country: str = Field(index=True)
    cost: Optional[float] = None
    housing_type: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProgramReview(SQLModel, table=True):
    __tablename__ = "program_review"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    program_id: int = Field(foreign_key="study_abroad_program.id", index=True)
    rating: int = Field(ge=1, le=5)  # 1-5 star rating
    review_text: str
    date: datetime = Field(default_factory=datetime.utcnow)


class CourseReview(SQLModel, table=True):
    __tablename__ = "course_review"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    program_id: int = Field(foreign_key="study_abroad_program.id", index=True)
    course_name: str
    instructor_name: Optional[str] = None
    rating: int = Field(ge=1, le=5)
    review_text: str
    date: datetime = Field(default_factory=datetime.utcnow)


class ProgramHousingReview(SQLModel, table=True):
    __tablename__ = "program_housing_review"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    program_id: int = Field(foreign_key="study_abroad_program.id", index=True)
    housing_description: str
    rating: int = Field(ge=1, le=5)
    review_text: str
    date: datetime = Field(default_factory=datetime.utcnow)


# ===== PLACE ECOSYSTEM (For Current Students) =====


class Place(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", index=True
    )  # Track who posted the place
    name: str = Field(index=True)
    category: str = Field(index=True)  # restaurant, activity, museum, housing, nightlife, etc.
    city: str = Field(index=True)
    country: str = Field(index=True)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    address: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PlaceReview(SQLModel, table=True):
    __tablename__ = "place_review"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    place_id: int = Field(foreign_key="place.id", index=True)
    rating: int = Field(ge=1, le=5)
    review_text: str
    date: datetime = Field(default_factory=datetime.utcnow)


# ===== TRIP ECOSYSTEM (For Trip Planning) =====


class Trip(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.id", index=True
    )  # Track who posted the trip
    destination: str = Field(index=True)
    country: str = Field(index=True)
    description: Optional[str] = None
    trip_type: Optional[str] = None  # weekend, spring break, summer, etc.
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TripReview(SQLModel, table=True):
    __tablename__ = "trip_review"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    trip_id: int = Field(foreign_key="trip.id", index=True)
    rating: int = Field(ge=1, le=5)
    review_text: str
    date: datetime = Field(default_factory=datetime.utcnow)


# ===== BOOKMARKS (For Favorites/Saved Items) =====


class ProgramBookmark(SQLModel, table=True):
    __tablename__ = "program_bookmark"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    program_id: int = Field(foreign_key="study_abroad_program.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Unique constraint: one user can only bookmark a program once
    __table_args__ = (sa.UniqueConstraint("user_id", "program_id"),)


class PlaceBookmark(SQLModel, table=True):
    __tablename__ = "place_bookmark"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    place_id: int = Field(foreign_key="place.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Unique constraint: one user can only bookmark a place once
    __table_args__ = (sa.UniqueConstraint("user_id", "place_id"),)


class TripBookmark(SQLModel, table=True):
    __tablename__ = "trip_bookmark"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    trip_id: int = Field(foreign_key="trip.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Unique constraint: one user can only bookmark a trip once
    __table_args__ = (sa.UniqueConstraint("user_id", "trip_id"),)


# ===== MESSAGING (For Peer-to-Peer Communication) =====


class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    sender_id: int = Field(foreign_key="user.id", index=True)
    recipient_id: int = Field(foreign_key="user.id", index=True)
    subject: str
    content: str
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Optional: Link message to a specific program/place/trip for context
    related_program_id: Optional[int] = Field(default=None, foreign_key="study_abroad_program.id")
    related_place_id: Optional[int] = Field(default=None, foreign_key="place.id")
    related_trip_id: Optional[int] = Field(default=None, foreign_key="trip.id")

    # For threaded replies
    parent_message_id: Optional[int] = Field(default=None, foreign_key="message.id")
