# Sprint 2 Log

## Branding

Renamed project to **Abroadly** - a peer-verified study abroad platform. Updated all project files, API titles, and documentation to reflect the new brand.

## Data Model Design

Designed comprehensive UML data model with three separate ecosystems:
- **Programs Ecosystem** - For prospective students researching programs (StudyAbroadProgram, ProgramReview, CourseReview, ProgramHousingReview)
- **Places Ecosystem** - For current students exploring their city (Place with categories like restaurant/activity/housing, PlaceReview)
- **Trips Ecosystem** - For planning weekend trips and travel (minimal implementation for now)

Key design decisions:
- Separated program housing (tied to programs) from independent housing (Place with category="housing")
- Course reviews tied to programs for academic evaluation
- All reviews linked to users for accountability
- Geolocation fields (lat/long) on Places for map integration
- Category-based Place model for flexibility (restaurants, activities, museums, housing, etc.)

## Database Implementation

Implemented all SQLModel classes with proper relationships:
- 8 new models: StudyAbroadProgram, ProgramReview, CourseReview, ProgramHousingReview, Place, PlaceReview, Trip, TripReview
- Foreign key relationships between all reviews and their respective entities
- Indexes on searchable fields (city, country, category, program_name)
- Rating validation (1-5 stars) on all review types
- Timestamps on all entities

Generated and applied Alembic migration `81e660d3fa35_add_program_place_and_trip_models` - all 8 new tables created successfully in SQLite.

## CRUD API Routes

Built complete REST API with full CRUD operations:

### Programs API (`/api/programs/`)
- List/create/update/delete programs
- Filtering by city and country
- Pagination support (skip/limit)
- POST `/api/programs/{id}/reviews` - Create program reviews
- POST `/api/programs/{id}/courses/reviews` - Create course reviews  
- POST `/api/programs/{id}/housing/reviews` - Create housing reviews
- GET endpoints for all review types

### Places API (`/api/places/`)
- List/create/update/delete places
- Filtering by city, country, and category
- Pagination support
- POST `/api/places/{id}/reviews` - Create place reviews
- GET endpoints for reviews

All write operations (POST/PUT/DELETE) require authentication. Read operations (GET) are public.

## Documentation

Created comprehensive documentation in new `docs/` folder:
- **API.md** - Complete API reference with request/response examples, data models, authentication guide, error handling, and frontend integration examples
- **data_model_diagram.md** - UML diagram using Mermaid showing all models and relationships
- **README.md** - Documentation index with viewing instructions

Updated main README.md with:
- New project name (Abroadly)
- Tech stack overview
- Project structure diagram
- Running instructions
- Link to interactive API docs at `/docs` endpoint

## Testing

- Added requests library for API testing
- Created `test_api.py` script to verify all endpoints
- All tests passing: GET endpoints return 200, filters working, auth required for writes
- Interactive API docs available at http://localhost:8000/docs (Swagger UI)

## Code Quality

- Removed unused `app/store.py` (leftover from in-memory storage)
- Updated `.gitignore` for test files
- Pre-commit hooks working with Ruff linting and formatting
- All code passing linting checks

## Project Structure

```
app/
├── auth/          # Authentication (magic links, JWT)
├── programs/      # Study abroad programs + reviews (NEW)
├── places/        # Places (restaurants, activities, housing) + reviews (NEW)
├── models.py      # All SQLModel database models
├── config.py      # Environment configuration
├── db.py          # Database connection
├── deps.py        # FastAPI dependencies
└── main.py        # App entry point

docs/              # API docs and UML diagrams (NEW)
migrations/        # Alembic database migrations
sprint_logs/       # Development sprint logs
```

## Next Steps

Ready for frontend development! Backend API is complete with:
- ✅ All data models implemented
- ✅ Full CRUD operations
- ✅ Authentication working
- ✅ Comprehensive documentation
- ✅ Clean, production-ready structure

Potential next features:
- Admin mode for content moderation
- Seed data script for development
- CORS middleware for frontend integration
- Aggregate ratings on programs/places
- Search endpoints
- User profiles and favorites

