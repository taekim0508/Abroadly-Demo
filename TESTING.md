# Testing Documentation

This document provides comprehensive instructions for running and understanding the testing suite for the project.

## Overview

The testing suite includes:

- **Backend Tests (pytest)**: Unit tests, integration tests, and API endpoint tests
- **Frontend Tests (Jest)**: Component tests, page integration tests, and unit tests

### Testing Framework Stack

**Backend:**
- pytest
- pytest-cov (code coverage)
- FastAPI TestClient
- httpx (async HTTP testing)

**Frontend:**
- Jest
- React Testing Library
- ts-jest (TypeScript support)
- jest-dom (DOM matchers)

## Test Coverage Goals

Coverage requirements:

- **Statement Coverage**: >85%
- **Path/Branch Coverage**: >75%
- **Functional Requirements**: >75% covered by tests

## Backend Testing (Python/FastAPI)

### Running Backend Tests

**Run all tests:**
```bash
pytest
```

**Run with coverage:**
```bash
pytest --cov=app --cov-report=html --cov-report=term-missing
```

**Run specific test file:**
```bash
pytest tests/test_auth.py
```

**Run specific test class:**
```bash
pytest tests/test_programs.py::TestProgramsCRUD
```

**Run specific test:**
```bash
pytest tests/test_auth.py::TestAuthEndpoints::test_request_link_valid_vanderbilt_email
```

**Run tests in verbose mode:**
```bash
pytest -v
```

**Run tests and stop at first failure:**
```bash
pytest -x
```

### Backend Test Structure

```
tests/
├── __init__.py
├── conftest.py                    # Shared fixtures
├── test_auth.py                   # Authentication tests
├── test_programs.py               # Program CRUD and review tests
├── test_places.py                 # Place CRUD and review tests
├── test_trips.py                  # Trip CRUD and review tests
└── test_integration.py            # Full workflow integration tests
```

### Backend Test Categories

#### 1. Unit Tests

**JWT Token Tests** (`test_auth.py::TestJWTUtilities`):
- Token creation and validation
- Token expiration
- Invalid token handling

**Magic Link Tests** (`test_auth.py::TestMagicLinkUtilities`):
- Magic token creation
- Token verification
- Token expiration

#### 2. API Endpoint Tests

**Authentication Endpoints** (`test_auth.py::TestAuthEndpoints`):
- Magic link request (valid/invalid domains)
- Callback verification
- `/me` endpoint authentication
- Logout functionality

**Profile Endpoints** (`test_auth.py::TestProfileEndpoints`):
- Profile retrieval
- Profile updates
- Onboarding questionnaire

**Review Management** (`test_auth.py::TestReviewEndpoints`):
- View user reviews
- Delete reviews (authorization checks)

#### 3. Integration Tests

**Program Workflows** (`test_integration.py::TestProgramWorkflow`):
- Complete CRUD lifecycle
- Program review creation and display
- Course review workflow
- Housing review workflow

**Place Workflows** (`test_integration.py::TestPlaceWorkflow`):
- Complete CRUD lifecycle
- Place review creation
- Category filtering

**Trip Workflows** (`test_integration.py::TestTripWorkflow`):
- Complete CRUD lifecycle
- Trip review creation

**Review Deletion** (`test_integration.py::TestReviewDeletion`):
- Delete own reviews
- Cannot delete others' reviews

### Backend Coverage Report

After running tests with coverage, view the HTML report:

```bash
open htmlcov/index.html
```

## Frontend Testing (React/TypeScript)

### Running Frontend Tests

Navigate to the frontend directory first:
```bash
cd abroadly
```

**Run all tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm run test:coverage
```

**Run in watch mode:**
```bash
npm run test:watch
```

**Run specific test file:**
```bash
npm test -- StarRating.test.tsx
```

**Update snapshots:**
```bash
npm test -- -u
```

### Frontend Test Structure

```
abroadly/src/
├── components/
│   ├── StarRating.tsx
│   ├── StarRating.test.tsx        # Component unit tests
│   ├── ProgramCard.tsx
│   └── ProgramCard.test.tsx       # Component unit tests
├── pages/
│   ├── Auth.tsx
│   └── Auth.test.tsx              # Page integration tests
└── setupTests.ts                   # Test configuration
```

### Frontend Test Categories

#### 1. Component Unit Tests

**StarRating Component** (`StarRating.test.tsx`):
- Basic rendering (5 describe blocks, 30+ test cases)
- Visual states (filled vs empty stars)
- Size variants (sm, md, lg)
- Interactive mode (click handling)
- Edge cases (fractional ratings, negative ratings)

**ProgramCard Component** (`ProgramCard.test.tsx`):
- Basic rendering (8 describe blocks, 25+ test cases)
- Optional field display
- Link functionality
- Cost formatting
- SVG icon rendering
- Edge cases (long text, empty fields)

#### 2. Page Integration Tests

**Auth Page** (`Auth.test.tsx`):
- Email form submission
- Token callback processing
- Error handling
- Success states
- Loading states

### Frontend Coverage Report

After running tests with coverage, view the report:

```bash
open coverage/lcov-report/index.html
```

**Backend Coverage:**
```bash
# Terminal report
pytest --cov=app --cov-report=term-missing

# HTML report
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

**Frontend Coverage:**
```bash
# Terminal and HTML report
npm run test:coverage
open coverage/lcov-report/index.html
```

### Coverage Thresholds

The project is configured with the following coverage requirements:

**Backend (pytest.ini):**
```ini
--cov-fail-under=85
```

**Frontend (jest.config.js):**
```javascript
coverageThresholds: {
  global: {
    statements: 85,
    branches: 75,
    functions: 85,
    lines: 85,
  },
}
```

### Understanding Coverage Metrics

- **Statement Coverage**: Percentage of executed statements
- **Branch Coverage**: Percentage of executed decision branches (if/else, switch, etc.)
- **Function Coverage**: Percentage of executed functions
- **Line Coverage**: Percentage of executed lines
