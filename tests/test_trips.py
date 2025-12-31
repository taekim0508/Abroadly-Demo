"""Tests for Trips API endpoints."""


class TestTripsCRUD:
    """Test CRUD operations for trips."""

    def test_list_trips(self, client):
        """Test listing all trips."""
        response = client.get("/api/trips/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_nonexistent_trip(self, client):
        """Test getting a trip that doesn't exist."""
        response = client.get("/api/trips/999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_trip_requires_auth(self, client, sample_trip_data):
        """Test that creating a trip requires authentication."""
        response = client.post("/api/trips/", json=sample_trip_data)
        assert response.status_code == 401

    def test_update_trip_requires_auth(self, client):
        """Test that updating a trip requires authentication."""
        response = client.put("/api/trips/1", json={"description": "Updated trip"})
        assert response.status_code == 401

    def test_delete_trip_requires_auth(self, client):
        """Test that deleting a trip requires authentication."""
        response = client.delete("/api/trips/1")
        assert response.status_code == 401


class TestTripsFiltering:
    """Test filtering and search for trips."""

    def test_filter_by_destination(self, client):
        """Test filtering trips by destination."""
        response = client.get("/api/trips/?destination=Amsterdam")
        assert response.status_code == 200
        trips = response.json()
        assert isinstance(trips, list)
        for trip in trips:
            assert trip.get("destination") == "Amsterdam"

    def test_filter_by_country(self, client):
        """Test filtering trips by country."""
        response = client.get("/api/trips/?country=Netherlands")
        assert response.status_code == 200
        trips = response.json()
        assert isinstance(trips, list)
        for trip in trips:
            assert trip.get("country") == "Netherlands"

    def test_filter_by_trip_type(self, client):
        """Test filtering trips by type."""
        response = client.get("/api/trips/?trip_type=weekend")
        assert response.status_code == 200
        trips = response.json()
        assert isinstance(trips, list)
        for trip in trips:
            assert trip.get("trip_type") == "weekend"

    def test_filter_multiple_parameters(self, client):
        """Test filtering with multiple parameters."""
        response = client.get("/api/trips/?country=Italy&trip_type=weekend")
        assert response.status_code == 200
        trips = response.json()
        assert isinstance(trips, list)
        for trip in trips:
            assert trip.get("country") == "Italy"
            assert trip.get("trip_type") == "weekend"

    def test_pagination_limit(self, client):
        """Test pagination with limit."""
        response = client.get("/api/trips/?limit=5")
        assert response.status_code == 200
        trips = response.json()
        assert len(trips) <= 5

    def test_pagination_skip(self, client):
        """Test pagination with skip."""
        response = client.get("/api/trips/?skip=10")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestTripReviews:
    """Test review functionality for trips."""

    def test_list_trip_reviews(self, client):
        """Test listing reviews for a trip."""
        response = client.get("/api/trips/1/reviews")
        assert response.status_code in [200, 404]

    def test_create_trip_review_requires_auth(self, client, sample_review_data):
        """Test that creating a trip review requires authentication."""
        response = client.post("/api/trips/1/reviews", json=sample_review_data)
        assert response.status_code == 401

    def test_review_nonexistent_trip(self, client, sample_review_data):
        """Test reviewing a trip that doesn't exist."""
        response = client.post("/api/trips/99999/reviews", json=sample_review_data)
        assert response.status_code in [401, 404]

    def test_list_reviews_pagination(self, client):
        """Test pagination for trip reviews."""
        response = client.get("/api/trips/1/reviews?limit=10")
        assert response.status_code in [200, 404]


class TestTripTypes:
    """Test different trip types."""

    def test_weekend_trips(self, client):
        """Test filtering for weekend trips."""
        response = client.get("/api/trips/?trip_type=weekend")
        assert response.status_code == 200
        trips = response.json()
        assert isinstance(trips, list)

    def test_spring_break_trips(self, client):
        """Test filtering for spring break trips."""
        response = client.get("/api/trips/?trip_type=spring break")
        assert response.status_code == 200

    def test_summer_trips(self, client):
        """Test filtering for summer trips."""
        response = client.get("/api/trips/?trip_type=summer")
        assert response.status_code == 200


class TestTripValidation:
    """Test data validation for trips."""

    def test_missing_required_fields(self, client):
        """Test that missing required fields are rejected."""
        incomplete_data = {
            "destination": "Amsterdam"
            # Missing country
        }
        response = client.post("/api/trips/", json=incomplete_data)
        assert response.status_code in [401, 422]

    def test_invalid_review_rating(self, client):
        """Test that invalid ratings are rejected."""
        invalid_review = {"rating": -1, "review_text": "Test review"}
        response = client.post("/api/trips/1/reviews", json=invalid_review)
        assert response.status_code in [401, 422]

    def test_empty_review_text(self, client):
        """Test that empty review text is handled."""
        invalid_review = {"rating": 5, "review_text": ""}
        response = client.post("/api/trips/1/reviews", json=invalid_review)
        # May pass validation but fail auth
        assert response.status_code in [401, 422]
