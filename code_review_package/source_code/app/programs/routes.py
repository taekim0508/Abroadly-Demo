from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from ..db import get_session
from ..deps import current_user
from ..models import (
    CourseReview,
    ProgramHousingReview,
    ProgramReview,
    StudyAbroadProgram,
    User,
)

router = APIRouter(prefix="/api/programs", tags=["programs"])


# ===== PYDANTIC SCHEMAS =====


class ProgramCreate(BaseModel):
    program_name: str
    institution: str
    city: str
    country: str
    cost: Optional[float] = None
    housing_type: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ProgramUpdate(BaseModel):
    program_name: Optional[str] = None
    institution: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    cost: Optional[float] = None
    housing_type: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None


class ProgramReviewCreate(BaseModel):
    rating: int
    review_text: str


class CourseReviewCreate(BaseModel):
    course_name: str
    instructor_name: Optional[str] = None
    rating: int
    review_text: str


class ProgramHousingReviewCreate(BaseModel):
    housing_description: str
    rating: int
    review_text: str


# ===== PROGRAM CRUD =====


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_program(
    program: ProgramCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a new study abroad program."""
    db_program = StudyAbroadProgram(**program.model_dump())
    session.add(db_program)
    session.commit()
    session.refresh(db_program)
    return db_program


@router.get("/", response_model=List[StudyAbroadProgram])
def list_programs(
    city: Optional[str] = None,
    country: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    """List all study abroad programs with optional filters."""
    query = select(StudyAbroadProgram)

    if city:
        query = query.where(StudyAbroadProgram.city == city)
    if country:
        query = query.where(StudyAbroadProgram.country == country)

    query = query.offset(skip).limit(limit)
    programs = session.exec(query).all()
    return programs


@router.get("/{program_id}")
def get_program(program_id: int, session: Session = Depends(get_session)):
    """Get a specific study abroad program by ID."""
    program = session.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")
    return program


@router.put("/{program_id}")
def update_program(
    program_id: int,
    program_update: ProgramUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Update a study abroad program."""
    program = session.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    update_data = program_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(program, key, value)

    session.add(program)
    session.commit()
    session.refresh(program)
    return program


@router.delete("/{program_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_program(
    program_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Delete a study abroad program."""
    program = session.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    session.delete(program)
    session.commit()
    return None


# ===== PROGRAM REVIEWS =====


@router.post("/{program_id}/reviews", status_code=status.HTTP_201_CREATED)
def create_program_review(
    program_id: int,
    review: ProgramReviewCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a review for a program."""
    # Check if program exists
    program = session.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    db_review = ProgramReview(user_id=user.id, program_id=program_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review


@router.get("/{program_id}/reviews")
def list_program_reviews(
    program_id: int, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    """List all reviews for a specific program."""
    query = (
        select(ProgramReview)
        .where(ProgramReview.program_id == program_id)
        .offset(skip)
        .limit(limit)
    )
    reviews = session.exec(query).all()
    return reviews


# ===== COURSE REVIEWS =====


@router.post("/{program_id}/courses/reviews", status_code=status.HTTP_201_CREATED)
def create_course_review(
    program_id: int,
    review: CourseReviewCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a course review for a program."""
    # Check if program exists
    program = session.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    db_review = CourseReview(user_id=user.id, program_id=program_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review


@router.get("/{program_id}/courses/reviews")
def list_course_reviews(
    program_id: int, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    """List all course reviews for a specific program."""
    query = (
        select(CourseReview).where(CourseReview.program_id == program_id).offset(skip).limit(limit)
    )
    reviews = session.exec(query).all()
    return reviews


# ===== HOUSING REVIEWS =====


@router.post("/{program_id}/housing/reviews", status_code=status.HTTP_201_CREATED)
def create_housing_review(
    program_id: int,
    review: ProgramHousingReviewCreate,
    session: Session = Depends(get_session),
    user: User = Depends(current_user),
):
    """Create a housing review for a program."""
    # Check if program exists
    program = session.get(StudyAbroadProgram, program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Program not found")

    db_review = ProgramHousingReview(user_id=user.id, program_id=program_id, **review.model_dump())
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review


@router.get("/{program_id}/housing/reviews")
def list_housing_reviews(
    program_id: int, skip: int = 0, limit: int = 100, session: Session = Depends(get_session)
):
    """List all housing reviews for a specific program."""
    query = (
        select(ProgramHousingReview)
        .where(ProgramHousingReview.program_id == program_id)
        .offset(skip)
        .limit(limit)
    )
    reviews = session.exec(query).all()
    return reviews
