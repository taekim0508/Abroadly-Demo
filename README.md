# Abroadly

**Abroadly** is a peer-verified study abroad platform that helps students make informed decisions about international programs through transparent, student-generated reviews and recommendations. The platform features three core ecosystems: a Programs section where prospective students can research study abroad opportunities with detailed reviews of academics, housing, and overall experience; a Places section providing current students with crowdsourced recommendations for restaurants, activities, and local housing via an interactive map; and a Trips section for planning weekend getaways and travel during their time abroad. Built with a FastAPI backend (Python, SQLModel, SQLite/Postgres-ready) and React + TypeScript frontend, Abroadly uses passwordless magic-link authentication and offers a comprehensive REST API for managing programs, places, reviews, and user-generated content.

## What it does
- **University email authentication** - Passwordless magic-link sign-in
- **Program discovery** - Browse and review study abroad programs
- **Comprehensive reviews** - Rate programs, courses, and housing
- **Local recommendations** - Find restaurants, activities, and places
- **Trip planning** - Coming soon: Plan weekend getaways
- **Interactive maps** - Coming soon: Visualize places on a map

## UI Preview

The Abroadly app features a modern, clean interface built with React and Tailwind CSS:

- **Landing Page** - Hero section with feature overview
- **Programs** - Browse and filter study abroad programs
- **Places** - Discover local recommendations
- **Reviews** - Read and write authentic student reviews
- **Authentication** - Passwordless magic-link sign-in

**Reference Mockup:** Our initial [lovable mockup](https://peerpath-abroad.lovable.app) helped guide the vision. The actual implementation has evolved with a custom design tailored to our backend API. 

## Quick Start

New to the project? Check out the [Getting Started Guide](GETTING_STARTED.md) for step-by-step setup instructions!

## Links
- [Trello Board](https://trello.com/invite/b/68c2fd989a60efd35141d359/ATTI0e86acdf030aabd16090578526ee9a918FE9AE7A/f25-group14)
- [Getting Started Guide](GETTING_STARTED.md) - Complete setup instructions

## Documentation
- [Getting Started Guide](GETTING_STARTED.md) - Complete setup instructions
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md) - Frontend build overview
- [API Documentation](docs/API.md) - Complete API reference with examples
- [Data Model UML Diagram](docs/data_model_diagram.md) - Database schema and relationships
- [Interactive API Docs](http://localhost:8000/docs) - Swagger UI (when server is running)
- [Sprint Logs](sprint_logs/) - Development progress tracking
- **Note:** Install [Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid) to view UML diagrams

## Using uv
Install:
```bash
brew install uv
```

Setup:
```bash
uv venv
source .venv/bin/activate
```

Basics:
```bash
uv add <package>
uv add -D <package>
uv sync
uv run python your_script.py
```

## Linting & CI
We use Ruff for linting and formatting. Locally, run `uv run ruff check --fix && uv run ruff format`. On push/PR, GitHub Actions runs the same checks to keep the codebase consistent.

See [CONTRIBUTING.md](CONTRIBUTING.md) for complete details on:
- Pre-commit hooks (Ruff linting)
- CI/CD requirements and coverage thresholds
- Running tests locally
- Known test limitations and skipped tests

## Running the App

### Backend

Start the backend server:
```bash
uv run uvicorn app.main:app --reload --port 8000
```

Visit http://localhost:8000/docs for interactive API documentation.

### Frontend

Start the frontend development server:
```bash
cd abroadly
npm install  # First time only
npm run dev
```

The app will be available at http://localhost:5173

### Seed Sample Data (Optional)

Populate the database with sample programs, places, and reviews:
```bash
uv run python seed_data.py
```

## Tech Stack

### Frontend
- **React** - Utilizing reusable components
- **Vite** - Modern build tool for faster development
- **Tailwind CSS** - CSS framework for unified UX
- **Axios** - Promise-based HTTP client for API requests

### Backend
- **FastAPI** - Modern Python web framework
- **SQLModel** - SQL databases with Python type hints
- **Alembic** - Database migrations
- **SQLite** - Dev database (Postgres-ready for production)

### Authentication
- **Magic-link email auth** - Passwordless authentication
- **JWT tokens** - Stored in HttpOnly cookies
- **Resend** - Email delivery (optional in dev)

### Database
SQLite in development (`app.db`), Postgres-ready for production. To switch to Postgres, set `DATABASE_URL` environment variable.

**Migrations:**
- Generate: `uv run alembic revision --autogenerate -m "description"`
- Apply: `uv run alembic upgrade head`

## Project Structure

```
app/
├── auth/          # Authentication (magic links, JWT)
├── programs/      # Study abroad programs + reviews
├── places/        # Places (restaurants, activities, housing) + reviews
├── models.py      # SQLModel database models
├── config.py      # Environment configuration
├── db.py          # Database connection
├── deps.py        # FastAPI dependencies
└── main.py        # App entry point

docs/              # API docs and UML diagrams
migrations/        # Alembic database migrations
sprint_logs/       # Development sprint logs
```
