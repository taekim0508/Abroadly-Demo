# Contributors:
# Lucas Slater: Setup and route writing (2 hrs)
# Trey Fisher: Route writing (2 hrs)

from typing import Optional

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
    db_program = StudyAbroadProgram(**program.model_dump(), user_id=user.id)  # Track who posted
    session.add(db_program)
    session.commit()
    session.refresh(db_program)
    return db_program


@router.get("/")
def list_programs(
    city: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    """List all study abroad programs with optional filters and rating info."""
    query = select(StudyAbroadProgram)

    if city:
        query = query.where(StudyAbroadProgram.city == city)
    if country:
        query = query.where(StudyAbroadProgram.country == country)
    if search:
        query = query.where(StudyAbroadProgram.program_name.ilike(f"%{search}%"))

    query = query.offset(skip).limit(limit)
    programs = session.exec(query).all()

    # Enrich programs with average rating and review count
    enriched_programs = []
    for program in programs:
        # Get all reviews for this program
        reviews = session.exec(
            select(ProgramReview).where(ProgramReview.program_id == program.id)
        ).all()

        review_count = len(reviews)
        average_rating = sum(r.rating for r in reviews) / review_count if review_count > 0 else None

        enriched_programs.append(
            {
                "id": program.id,
                "program_name": program.program_name,
                "institution": program.institution,
                "city": program.city,
                "country": program.country,
                "cost": program.cost,
                "housing_type": program.housing_type,
                "location": program.location,
                "duration": program.duration,
                "description": program.description,
                "created_at": program.created_at,
                "average_rating": round(average_rating, 1) if average_rating else None,
                "review_count": review_count,
            }
        )

    return enriched_programs


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
    """List all reviews for a specific program with reviewer info."""
    query = (
        select(ProgramReview)
        .where(ProgramReview.program_id == program_id)
        .offset(skip)
        .limit(limit)
    )
    reviews = session.exec(query).all()

    # Enrich reviews with user info
    enriched_reviews = []
    for review in reviews:
        user = session.get(User, review.user_id)
        enriched_reviews.append(
            {
                "id": review.id,
                "user_id": review.user_id,
                "program_id": review.program_id,
                "rating": review.rating,
                "review_text": review.review_text,
                "date": review.date,
                # User info for enhanced display
                "reviewer": {
                    "id": user.id if user else None,
                    "first_name": user.first_name if user else None,
                    "last_name": user.last_name if user else None,
                    "institution": user.institution if user else None,
                    "study_abroad_status": user.study_abroad_status if user else None,
                    "program_name": user.program_name if user else None,
                    "program_city": user.program_city if user else None,
                    "program_country": user.program_country if user else None,
                    "program_term": user.program_term if user else None,
                }
                if user
                else None,
            }
        )
    return enriched_reviews


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
    """List all course reviews for a specific program with reviewer info."""
    query = (
        select(CourseReview).where(CourseReview.program_id == program_id).offset(skip).limit(limit)
    )
    reviews = session.exec(query).all()

    # Enrich reviews with user info
    enriched_reviews = []
    for review in reviews:
        user = session.get(User, review.user_id)
        enriched_reviews.append(
            {
                "id": review.id,
                "user_id": review.user_id,
                "program_id": review.program_id,
                "course_name": review.course_name,
                "instructor_name": review.instructor_name,
                "rating": review.rating,
                "review_text": review.review_text,
                "date": review.date,
                "reviewer": {
                    "id": user.id if user else None,
                    "first_name": user.first_name if user else None,
                    "last_name": user.last_name if user else None,
                    "institution": user.institution if user else None,
                    "study_abroad_status": user.study_abroad_status if user else None,
                    "program_name": user.program_name if user else None,
                    "program_city": user.program_city if user else None,
                    "program_country": user.program_country if user else None,
                    "program_term": user.program_term if user else None,
                }
                if user
                else None,
            }
        )
    return enriched_reviews


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
    """List all housing reviews for a specific program with reviewer info."""
    query = (
        select(ProgramHousingReview)
        .where(ProgramHousingReview.program_id == program_id)
        .offset(skip)
        .limit(limit)
    )
    reviews = session.exec(query).all()

    # Enrich reviews with user info
    enriched_reviews = []
    for review in reviews:
        user = session.get(User, review.user_id)
        enriched_reviews.append(
            {
                "id": review.id,
                "user_id": review.user_id,
                "program_id": review.program_id,
                "housing_description": review.housing_description,
                "rating": review.rating,
                "review_text": review.review_text,
                "date": review.date,
                "reviewer": {
                    "id": user.id if user else None,
                    "first_name": user.first_name if user else None,
                    "last_name": user.last_name if user else None,
                    "institution": user.institution if user else None,
                    "study_abroad_status": user.study_abroad_status if user else None,
                    "program_name": user.program_name if user else None,
                    "program_city": user.program_city if user else None,
                    "program_country": user.program_country if user else None,
                    "program_term": user.program_term if user else None,
                }
                if user
                else None,
            }
        )
    return enriched_reviews
