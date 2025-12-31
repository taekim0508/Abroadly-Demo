from datetime import datetime
from typing import Optional

import sqlalchemy as sa
from sqlmodel import Field, SQLModel

# ===== USER =====


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(sa_column=sa.Column(sa.String, unique=True, index=True))
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ===== PROGRAM ECOSYSTEM (For Prospective Students) =====


class StudyAbroadProgram(SQLModel, table=True):
    __tablename__ = "study_abroad_program"

    id: Optional[int] = Field(default=None, primary_key=True)
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
