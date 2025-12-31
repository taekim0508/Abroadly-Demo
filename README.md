# 🌍 Abroadly

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2+-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> **A peer-verified study abroad platform** that helps students make informed decisions about international programs through transparent, student-generated reviews and recommendations.

## 🎯 Overview

**Abroadly** is a full-stack web application featuring three core ecosystems:

- **Programs** - Research study abroad opportunities with detailed reviews of academics, housing, and overall experience
- **Places** - Discover crowdsourced recommendations for restaurants, activities, and local housing
- **Trips** - Plan weekend getaways and travel during study abroad (coming soon)

Built with modern technologies and best practices, featuring passwordless authentication, RESTful API design, and a responsive user interface.

## ✨ Key Features

- 🔐 **Passwordless Authentication** - Magic-link email authentication with JWT tokens
- 📚 **Program Discovery** - Browse and filter study abroad programs with detailed information
- ⭐ **Comprehensive Reviews** - Rate and review programs, courses, and housing
- 🗺️ **Local Recommendations** - Find restaurants, activities, and places with student reviews
- 🎨 **Modern UI/UX** - Responsive design built with React and Tailwind CSS
- 🚀 **RESTful API** - Well-documented FastAPI backend with Swagger/OpenAPI docs
- 🗄️ **Database Migrations** - Alembic for version-controlled schema changes
- 🧪 **Test Coverage** - Comprehensive test suite with pytest

## UI Preview

The Abroadly app features a modern, clean interface built with React and Tailwind CSS:

- **Landing Page** - Hero section with feature overview
- **Programs** - Browse and filter study abroad programs
- **Places** - Discover local recommendations
- **Reviews** - Read and write authentic student reviews
- **Authentication** - Passwordless magic-link sign-in

**Reference Mockup:** Our initial [lovable mockup](https://peerpath-abroad.lovable.app) helped guide the vision. The actual implementation has evolved with a custom design tailored to our backend API. 

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm
- [uv](https://github.com/astral-sh/uv) (Python package manager) - `brew install uv`

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Abroadly-Demo
   ```

2. **Set up the backend**
   ```bash
   # Create virtual environment
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   
   # Install dependencies
   uv sync
   
   # Run database migrations
   uv run alembic upgrade head
   ```

3. **Set up the frontend**
   ```bash
   cd abroadly
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Copy .env.example to .env and fill in your values
   cp .env.example .env
   ```

5. **Start the development servers**
   
   Backend (Terminal 1):
   ```bash
   uv run uvicorn app.main:app --reload --port 8000
   ```
   
   Frontend (Terminal 2):
   ```bash
   cd abroadly
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API Docs: http://localhost:8000/docs

### Seed Sample Data (Optional)
```bash
uv run python seed_data.py
```

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

## 📖 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[Data Model Diagram](docs/data_model_diagram.md)** - Database schema and relationships
- **[Testing Guide](TESTING.md)** - How to run tests and coverage reports
- **[Contributing Guide](CONTRIBUTING.md)** - Development guidelines and CI/CD setup
- **[Quick Start Guide](QUICK_START.md)** - Detailed setup instructions

### Interactive API Documentation

When the backend server is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛠️ Tech Stack

### Frontend
- **React 18** - Component-based UI with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing

### Backend
- **FastAPI** - Modern, fast Python web framework with automatic API docs
- **SQLModel** - SQL databases with Python type hints (built on SQLAlchemy)
- **Alembic** - Database migration tool
- **Pydantic** - Data validation using Python type annotations
- **Uvicorn** - ASGI server

### Authentication & Security
- **Magic-link email auth** - Passwordless authentication flow
- **JWT tokens** - Secure session management with HttpOnly cookies
- **Resend** - Email delivery service integration
- **CORS** - Configurable cross-origin resource sharing

### Database
- **SQLite** - Development database
- **PostgreSQL** - Production-ready (via DATABASE_URL)

### 🗄️ Database

- **Development**: SQLite (`app.db`)
- **Production**: PostgreSQL (configure via `DATABASE_URL`)

### Database Migrations

```bash
# Generate a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback one migration
uv run alembic downgrade -1
```

## 📁 Project Structure

```
Abroadly-Demo/
├── app/                    # Backend application
│   ├── auth/              # Authentication (magic links, JWT)
│   ├── programs/          # Study abroad programs + reviews
│   ├── places/            # Places (restaurants, activities, housing)
│   ├── trips/             # Trip planning features
│   ├── models.py          # SQLModel database models
│   ├── config.py          # Environment configuration
│   ├── db.py              # Database connection
│   ├── deps.py            # FastAPI dependencies
│   └── main.py            # Application entry point
│
├── abroadly/              # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── context/      # React context providers
│   │   └── hooks/        # Custom React hooks
│   └── package.json
│
├── tests/                 # Backend test suite
├── migrations/            # Alembic database migrations
├── docs/                  # API documentation and diagrams
├── pyproject.toml         # Python dependencies and config
└── README.md              # This file
```

## 🧪 Testing

```bash
# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=app --cov-report=html

# Run frontend tests
cd abroadly
npm test
```

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines, code style, and CI/CD requirements.

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ for students exploring study abroad opportunities**