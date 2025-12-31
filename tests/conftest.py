"""Pytest configuration and fixtures for tests."""

import importlib
import os

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine

from app import config
from app.db import get_session
from app.main import app

# Set test environment variables BEFORE importing anything from app
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["RESEND_API_KEY"] = ""  # Disable email sending in tests
os.environ["EMAIL_FROM"] = ""
os.environ["ALLOWED_EMAIL_DOMAINS"] = "vanderbilt.edu"  # Only allow Vanderbilt emails in tests

importlib.reload(config)


# Create test database engine - use a test database file
@pytest.fixture(scope="session")
def engine():
    """Create test database engine."""
    # Use a test database file that will be cleaned up
    test_engine = create_engine(
        "sqlite:///./test.db", echo=False, connect_args={"check_same_thread": False}
    )
    SQLModel.metadata.create_all(test_engine)
    yield test_engine
    # Clean up - drop all tables and close connections
    SQLModel.metadata.drop_all(test_engine)
    test_engine.dispose()
    # Remove the test database file
    import pathlib

    test_db_path = pathlib.Path("./test.db")
    if test_db_path.exists():
        test_db_path.unlink()


@pytest.fixture(scope="function")
def session(engine):
    """Create a new database session with a rollback at the end of each test."""
    connection = engine.connect()
    transaction = connection.begin()
    test_session = Session(bind=connection)

    yield test_session

    test_session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(session):
    """Create a test client with overridden dependencies."""

    def get_test_session():
        yield session

    app.dependency_overrides[get_session] = get_test_session

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def sample_program_data():
    """Sample program data for testing."""
    return {
        "program_name": "Test Study Abroad Program",
        "institution": "Test University",
        "city": "Paris",
        "country": "France",
        "cost": 15000.0,
        "duration": "Semester",
        "description": "A great program in Paris",
    }


@pytest.fixture
def sample_place_data():
    """Sample place data for testing."""
    return {
        "name": "Test Restaurant",
        "category": "restaurant",
        "city": "Barcelona",
        "country": "Spain",
        "latitude": 41.3851,
        "longitude": 2.1734,
        "address": "123 Test Street",
        "description": "Great local restaurant",
    }


@pytest.fixture
def sample_trip_data():
    """Sample trip data for testing."""
    return {
        "destination": "Amsterdam",
        "country": "Netherlands",
        "trip_type": "weekend",
        "description": "Weekend trip to Amsterdam",
    }


@pytest.fixture
def sample_review_data():
    """Sample review data for testing."""
    return {"rating": 5, "review_text": "Excellent experience! Highly recommend."}
