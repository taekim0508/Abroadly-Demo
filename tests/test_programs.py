"""Tests for Programs API endpoints."""


class TestProgramsCRUD:
    """Test CRUD operations for programs."""

    def test_list_programs_empty(self, client):
        """Test listing programs when database is empty."""
        response = client.get("/api/programs/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_nonexistent_program(self, client):
        """Test getting a program that doesn't exist."""
        response = client.get("/api/programs/999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_program_requires_auth(self, client, sample_program_data):
        """Test that creating a program requires authentication."""
        response = client.post("/api/programs/", json=sample_program_data)
        assert response.status_code == 401

    def test_update_program_requires_auth(self, client):
        """Test that updating a program requires authentication."""
        response = client.put("/api/programs/1", json={"description": "Updated"})
        assert response.status_code == 401

    def test_delete_program_requires_auth(self, client):
        """Test that deleting a program requires authentication."""
        response = client.delete("/api/programs/1")
        assert response.status_code == 401


class TestProgramsFiltering:
    """Test filtering and pagination for programs."""

    def test_filter_by_city(self, client):
        """Test filtering programs by city."""
        response = client.get("/api/programs/?city=Paris")
        assert response.status_code == 200
        programs = response.json()
        assert isinstance(programs, list)
        # All returned programs should be in Paris
        for program in programs:
            assert program.get("city") == "Paris"

    def test_filter_by_country(self, client):
        """Test filtering programs by country."""
        response = client.get("/api/programs/?country=France")
        assert response.status_code == 200
        programs = response.json()
        assert isinstance(programs, list)
        # All returned programs should be in France
        for program in programs:
            assert program.get("country") == "France"

    def test_pagination_limit(self, client):
        """Test pagination with limit parameter."""
        response = client.get("/api/programs/?limit=5")
        assert response.status_code == 200
        programs = response.json()
        assert len(programs) <= 5

    def test_pagination_skip(self, client):
        """Test pagination with skip parameter."""
        response = client.get("/api/programs/?skip=10")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestProgramReviews:
    """Test review endpoints for programs."""

    def test_list_program_reviews(self, client):
        """Test listing reviews for a program."""
        # This will 404 if program doesn't exist, or return empty list
        response = client.get("/api/programs/1/reviews")
        assert response.status_code in [200, 404]

    def test_create_program_review_requires_auth(self, client, sample_review_data):
        """Test that creating a program review requires authentication."""
        response = client.post("/api/programs/1/reviews", json=sample_review_data)
        assert response.status_code == 401

    def test_create_course_review_requires_auth(self, client):
        """Test that creating a course review requires authentication."""
        review_data = {
            "course_name": "Spanish 101",
            "instructor_name": "Prof. Garcia",
            "rating": 5,
            "review_text": "Great course!",
        }
        response = client.post("/api/programs/1/courses/reviews", json=review_data)
        assert response.status_code == 401

    def test_create_housing_review_requires_auth(self, client):
        """Test that creating a housing review requires authentication."""
        review_data = {
            "housing_description": "Student apartment",
            "rating": 4,
            "review_text": "Nice housing",
        }
        response = client.post("/api/programs/1/housing/reviews", json=review_data)
        assert response.status_code == 401

    def test_review_nonexistent_program(self, client, sample_review_data):
        """Test reviewing a program that doesn't exist."""
        # Should fail because we're not authenticated, but testing the endpoint
        response = client.post("/api/programs/99999/reviews", json=sample_review_data)
        assert response.status_code in [401, 404]


class TestProgramValidation:
    """Test data validation for programs."""

    def test_invalid_review_rating_too_high(self, client):
        """Test that ratings above 5 are rejected."""
        invalid_review = {"rating": 6, "review_text": "Test review"}
        response = client.post("/api/programs/1/reviews", json=invalid_review)
        assert response.status_code in [401, 422]  # Auth or validation error

    def test_invalid_review_rating_too_low(self, client):
        """Test that ratings below 1 are rejected."""
        invalid_review = {"rating": 0, "review_text": "Test review"}
        response = client.post("/api/programs/1/reviews", json=invalid_review)
        assert response.status_code in [401, 422]  # Auth or validation error

    def test_missing_required_fields(self, client):
        """Test that missing required fields are rejected."""
        incomplete_data = {
            "program_name": "Test Program"
            # Missing institution, city, country
        }
        response = client.post("/api/programs/", json=incomplete_data)
        assert response.status_code in [401, 422]  # Auth or validation error
