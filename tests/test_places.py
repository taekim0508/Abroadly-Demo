"""Tests for Places API endpoints."""


class TestPlacesCRUD:
    """Test CRUD operations for places."""

    def test_list_places(self, client):
        """Test listing all places."""
        response = client.get("/api/places/")
        assert response.status_code == 200
        assert isinstance(response.json(), list)

    def test_get_nonexistent_place(self, client):
        """Test getting a place that doesn't exist."""
        response = client.get("/api/places/999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_create_place_requires_auth(self, client, sample_place_data):
        """Test that creating a place requires authentication."""
        response = client.post("/api/places/", json=sample_place_data)
        assert response.status_code == 401

    def test_update_place_requires_auth(self, client):
        """Test that updating a place requires authentication."""
        response = client.put("/api/places/1", json={"description": "Updated"})
        assert response.status_code == 401

    def test_delete_place_requires_auth(self, client):
        """Test that deleting a place requires authentication."""
        response = client.delete("/api/places/1")
        assert response.status_code == 401


class TestPlacesFiltering:
    """Test filtering and search for places."""

    def test_filter_by_city(self, client):
        """Test filtering places by city."""
        response = client.get("/api/places/?city=Barcelona")
        assert response.status_code == 200
        places = response.json()
        assert isinstance(places, list)
        for place in places:
            assert place.get("city") == "Barcelona"

    def test_filter_by_country(self, client):
        """Test filtering places by country."""
        response = client.get("/api/places/?country=Spain")
        assert response.status_code == 200
        places = response.json()
        assert isinstance(places, list)
        for place in places:
            assert place.get("country") == "Spain"

    def test_filter_by_category(self, client):
        """Test filtering places by category."""
        response = client.get("/api/places/?category=restaurant")
        assert response.status_code == 200
        places = response.json()
        assert isinstance(places, list)
        for place in places:
            assert place.get("category") == "restaurant"

    def test_filter_multiple_parameters(self, client):
        """Test filtering with multiple parameters."""
        response = client.get("/api/places/?city=Barcelona&category=restaurant")
        assert response.status_code == 200
        places = response.json()
        assert isinstance(places, list)
        for place in places:
            assert place.get("city") == "Barcelona"
            assert place.get("category") == "restaurant"

    def test_pagination_limit(self, client):
        """Test pagination with limit."""
        response = client.get("/api/places/?limit=3")
        assert response.status_code == 200
        places = response.json()
        assert len(places) <= 3

    def test_pagination_skip(self, client):
        """Test pagination with skip."""
        response = client.get("/api/places/?skip=5")
        assert response.status_code == 200
        assert isinstance(response.json(), list)


class TestPlaceReviews:
    """Test review functionality for places."""

    def test_list_place_reviews(self, client):
        """Test listing reviews for a place."""
        response = client.get("/api/places/1/reviews")
        assert response.status_code in [200, 404]

    def test_create_place_review_requires_auth(self, client, sample_review_data):
        """Test that creating a place review requires authentication."""
        response = client.post("/api/places/1/reviews", json=sample_review_data)
        assert response.status_code == 401

    def test_review_nonexistent_place(self, client, sample_review_data):
        """Test reviewing a place that doesn't exist."""
        response = client.post("/api/places/99999/reviews", json=sample_review_data)
        assert response.status_code in [401, 404]

    def test_list_reviews_pagination(self, client):
        """Test pagination for place reviews."""
        response = client.get("/api/places/1/reviews?limit=5")
        assert response.status_code in [200, 404]


class TestPlaceValidation:
    """Test data validation for places."""

    def test_invalid_coordinates(self, client):
        """Test that invalid coordinates are handled."""
        invalid_data = {
            "name": "Test Place",
            "category": "restaurant",
            "city": "Barcelona",
            "country": "Spain",
            "latitude": 200.0,  # Invalid latitude
            "longitude": 2.1734,
        }
        response = client.post("/api/places/", json=invalid_data)
        # Will fail auth first, but testing endpoint
        assert response.status_code in [401, 422]

    def test_missing_required_fields(self, client):
        """Test that missing required fields are rejected."""
        incomplete_data = {
            "name": "Test Place",
            "category": "restaurant",
            # Missing city, country
        }
        response = client.post("/api/places/", json=incomplete_data)
        assert response.status_code in [401, 422]

    def test_invalid_review_rating(self, client):
        """Test that invalid ratings are rejected."""
        invalid_review = {"rating": 10, "review_text": "Test"}
        response = client.post("/api/places/1/reviews", json=invalid_review)
        assert response.status_code in [401, 422]


class TestPlaceCategories:
    """Test category-specific functionality."""

    def test_restaurant_category(self, client):
        """Test filtering for restaurants."""
        response = client.get("/api/places/?category=restaurant")
        assert response.status_code == 200

    def test_activity_category(self, client):
        """Test filtering for activities."""
        response = client.get("/api/places/?category=activity")
        assert response.status_code == 200

    def test_housing_category(self, client):
        """Test filtering for housing."""
        response = client.get("/api/places/?category=housing")
        assert response.status_code == 200

    def test_museum_category(self, client):
        """Test filtering for museums."""
        response = client.get("/api/places/?category=museum")
        assert response.status_code == 200
