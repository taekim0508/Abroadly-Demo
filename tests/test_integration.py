"""Integration tests for full workflows with database interactions."""

import random

from fastapi.testclient import TestClient

from app.auth.magic import make_magic_token
from app.main import app

client = TestClient(app)


def get_authenticated_client():
    """Helper function to get an authenticated test client."""
    email = f"testuser{random.randint(10000, 99999)}@vanderbilt.edu"
    token = make_magic_token(email)
    auth_response = client.get(f"/auth/callback?token={token}")
    return client, auth_response.cookies, email


class TestProgramWorkflow:
    """Integration tests for complete program workflows."""

    def test_complete_program_lifecycle(self):
        """Test creating, reading, updating, and deleting a program."""
        test_client, cookies, email = get_authenticated_client()

        # Create a program
        program_data = {
            "program_name": "Integration Test Program",
            "institution": "Test University",
            "city": "Paris",
            "country": "France",
            "cost": 15000.0,
            "duration": "Semester",
            "description": "Test program for integration testing",
        }
        create_response = test_client.post("/api/programs/", json=program_data, cookies=cookies)
        assert create_response.status_code == 201
        created_program = create_response.json()
        program_id = created_program["id"]
        assert created_program["program_name"] == program_data["program_name"]

        # Read the program
        get_response = test_client.get(f"/api/programs/{program_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == program_id

        # Update the program
        update_data = {"description": "Updated description"}
        update_response = test_client.put(
            f"/api/programs/{program_id}", json=update_data, cookies=cookies
        )
        assert update_response.status_code == 200
        assert update_response.json()["description"] == "Updated description"

        # List programs (should include our program)
        list_response = test_client.get("/api/programs/")
        assert list_response.status_code == 200
        programs = list_response.json()
        assert any(p["id"] == program_id for p in programs)

        # Delete the program
        delete_response = test_client.delete(f"/api/programs/{program_id}", cookies=cookies)
        assert delete_response.status_code == 204

        # Verify deletion
        get_deleted = test_client.get(f"/api/programs/{program_id}")
        assert get_deleted.status_code == 404

    def test_program_review_workflow(self):
        """Test complete workflow for creating and listing program reviews."""
        test_client, cookies, email = get_authenticated_client()

        # Create a program first
        program_data = {
            "program_name": "Review Test Program",
            "institution": "Test University",
            "city": "Barcelona",
            "country": "Spain",
        }
        program_response = test_client.post("/api/programs/", json=program_data, cookies=cookies)
        program_id = program_response.json()["id"]

        # Create a program review
        review_data = {"rating": 5, "review_text": "Excellent program! Highly recommend."}
        review_response = test_client.post(
            f"/api/programs/{program_id}/reviews", json=review_data, cookies=cookies
        )
        assert review_response.status_code == 201
        created_review = review_response.json()
        assert created_review["rating"] == 5

        # List reviews for the program
        list_reviews = test_client.get(f"/api/programs/{program_id}/reviews")
        assert list_reviews.status_code == 200
        reviews = list_reviews.json()
        assert len(reviews) >= 1
        assert any(r["review_text"] == review_data["review_text"] for r in reviews)

        # Verify review appears in user's reviews
        my_reviews = test_client.get("/auth/my-reviews", cookies=cookies)
        assert my_reviews.status_code == 200
        user_reviews = my_reviews.json()
        assert len(user_reviews["program_reviews"]) >= 1

        # Cleanup
        test_client.delete(f"/api/programs/{program_id}", cookies=cookies)

    def test_course_review_workflow(self):
        """Test complete workflow for course reviews."""
        test_client, cookies, email = get_authenticated_client()

        # Create a program
        program_data = {
            "program_name": "Course Review Test",
            "institution": "Test University",
            "city": "Madrid",
            "country": "Spain",
        }
        program_response = test_client.post("/api/programs/", json=program_data, cookies=cookies)
        program_id = program_response.json()["id"]

        # Create a course review
        course_review_data = {
            "course_name": "Spanish 101",
            "instructor_name": "Prof. Garcia",
            "rating": 5,
            "review_text": "Great course, learned a lot!",
        }
        review_response = test_client.post(
            f"/api/programs/{program_id}/courses/reviews", json=course_review_data, cookies=cookies
        )
        assert review_response.status_code == 201
        assert review_response.json()["course_name"] == "Spanish 101"

        # List course reviews
        list_response = test_client.get(f"/api/programs/{program_id}/courses/reviews")
        assert list_response.status_code == 200
        assert len(list_response.json()) >= 1

        # Cleanup
        test_client.delete(f"/api/programs/{program_id}", cookies=cookies)

    def test_housing_review_workflow(self):
        """Test complete workflow for housing reviews."""
        test_client, cookies, email = get_authenticated_client()

        # Create a program
        program_data = {
            "program_name": "Housing Review Test",
            "institution": "Test University",
            "city": "Rome",
            "country": "Italy",
        }
        program_response = test_client.post("/api/programs/", json=program_data, cookies=cookies)
        program_id = program_response.json()["id"]

        # Create a housing review
        housing_review_data = {
            "housing_description": "Student apartment near campus",
            "rating": 4,
            "review_text": "Good location, affordable",
        }
        review_response = test_client.post(
            f"/api/programs/{program_id}/housing/reviews", json=housing_review_data, cookies=cookies
        )
        assert review_response.status_code == 201
        assert review_response.json()["rating"] == 4

        # List housing reviews
        list_response = test_client.get(f"/api/programs/{program_id}/housing/reviews")
        assert list_response.status_code == 200
        assert len(list_response.json()) >= 1

        # Cleanup
        test_client.delete(f"/api/programs/{program_id}", cookies=cookies)


class TestPlaceWorkflow:
    """Integration tests for complete place workflows."""

    def test_complete_place_lifecycle(self):
        """Test creating, reading, updating, and deleting a place."""
        test_client, cookies, email = get_authenticated_client()

        # Create a place
        place_data = {
            "name": "Integration Test Restaurant",
            "category": "restaurant",
            "city": "Barcelona",
            "country": "Spain",
            "latitude": 41.3851,
            "longitude": 2.1734,
            "address": "123 Test Street",
            "description": "Great local food",
        }
        create_response = test_client.post("/api/places/", json=place_data, cookies=cookies)
        assert create_response.status_code == 201
        created_place = create_response.json()
        place_id = created_place["id"]
        assert created_place["name"] == place_data["name"]

        # Read the place
        get_response = test_client.get(f"/api/places/{place_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == place_id

        # Update the place
        update_data = {"description": "Updated - Amazing food!"}
        update_response = test_client.put(
            f"/api/places/{place_id}", json=update_data, cookies=cookies
        )
        assert update_response.status_code == 200
        assert update_response.json()["description"] == "Updated - Amazing food!"

        # List places
        list_response = test_client.get("/api/places/")
        assert list_response.status_code == 200
        places = list_response.json()
        assert any(p["id"] == place_id for p in places)

        # Delete the place
        delete_response = test_client.delete(f"/api/places/{place_id}", cookies=cookies)
        assert delete_response.status_code == 204

        # Verify deletion
        get_deleted = test_client.get(f"/api/places/{place_id}")
        assert get_deleted.status_code == 404

    def test_place_review_workflow(self):
        """Test complete workflow for place reviews."""
        test_client, cookies, email = get_authenticated_client()

        # Create a place
        place_data = {
            "name": "Test Cafe",
            "category": "restaurant",
            "city": "Paris",
            "country": "France",
        }
        place_response = test_client.post("/api/places/", json=place_data, cookies=cookies)
        place_id = place_response.json()["id"]

        # Create a review
        review_data = {"rating": 5, "review_text": "Best coffee in Paris!"}
        review_response = test_client.post(
            f"/api/places/{place_id}/reviews", json=review_data, cookies=cookies
        )
        assert review_response.status_code == 201
        assert review_response.json()["rating"] == 5

        # List reviews
        list_reviews = test_client.get(f"/api/places/{place_id}/reviews")
        assert list_reviews.status_code == 200
        reviews = list_reviews.json()
        assert len(reviews) >= 1

        # Verify in user's reviews
        my_reviews = test_client.get("/auth/my-reviews", cookies=cookies)
        assert my_reviews.status_code == 200
        assert len(my_reviews.json()["place_reviews"]) >= 1

        # Cleanup
        test_client.delete(f"/api/places/{place_id}", cookies=cookies)

    def test_place_filtering(self):
        """Test filtering places by category, city, and country."""
        test_client, cookies, email = get_authenticated_client()

        # Create places in different categories/cities
        places_data = [
            {
                "name": "Restaurant A",
                "category": "restaurant",
                "city": "Paris",
                "country": "France",
            },
            {"name": "Museum B", "category": "museum", "city": "Paris", "country": "France"},
            {"name": "Restaurant C", "category": "restaurant", "city": "Rome", "country": "Italy"},
        ]

        place_ids = []
        for place_data in places_data:
            response = test_client.post("/api/places/", json=place_data, cookies=cookies)
            place_ids.append(response.json()["id"])

        # Filter by category
        category_response = test_client.get("/api/places/?category=restaurant")
        assert category_response.status_code == 200
        restaurants = category_response.json()
        assert all(p["category"] == "restaurant" for p in restaurants)

        # Filter by city
        city_response = test_client.get("/api/places/?city=Paris")
        assert city_response.status_code == 200
        paris_places = city_response.json()
        assert all(p["city"] == "Paris" for p in paris_places)

        # Cleanup
        for place_id in place_ids:
            test_client.delete(f"/api/places/{place_id}", cookies=cookies)


class TestTripWorkflow:
    """Integration tests for complete trip workflows."""

    def test_complete_trip_lifecycle(self):
        """Test creating, reading, updating, and deleting a trip."""
        test_client, cookies, email = get_authenticated_client()

        # Create a trip
        trip_data = {
            "destination": "Amsterdam",
            "country": "Netherlands",
            "trip_type": "weekend",
            "description": "Weekend trip to Amsterdam",
        }
        create_response = test_client.post("/api/trips/", json=trip_data, cookies=cookies)
        assert create_response.status_code == 201
        created_trip = create_response.json()
        trip_id = created_trip["id"]
        assert created_trip["destination"] == trip_data["destination"]

        # Read the trip
        get_response = test_client.get(f"/api/trips/{trip_id}")
        assert get_response.status_code == 200
        assert get_response.json()["id"] == trip_id

        # Update the trip
        update_data = {"description": "Extended weekend in Amsterdam!"}
        update_response = test_client.put(
            f"/api/trips/{trip_id}", json=update_data, cookies=cookies
        )
        assert update_response.status_code == 200
        assert update_response.json()["description"] == "Extended weekend in Amsterdam!"

        # List trips
        list_response = test_client.get("/api/trips/")
        assert list_response.status_code == 200
        trips = list_response.json()
        assert any(t["id"] == trip_id for t in trips)

        # Delete the trip
        delete_response = test_client.delete(f"/api/trips/{trip_id}", cookies=cookies)
        assert delete_response.status_code == 204

        # Verify deletion
        get_deleted = test_client.get(f"/api/trips/{trip_id}")
        assert get_deleted.status_code == 404

    def test_trip_review_workflow(self):
        """Test complete workflow for trip reviews."""
        test_client, cookies, email = get_authenticated_client()

        # Create a trip
        trip_data = {"destination": "Prague", "country": "Czech Republic", "trip_type": "weekend"}
        trip_response = test_client.post("/api/trips/", json=trip_data, cookies=cookies)
        trip_id = trip_response.json()["id"]

        # Create a review
        review_data = {"rating": 5, "review_text": "Amazing city, highly recommend!"}
        review_response = test_client.post(
            f"/api/trips/{trip_id}/reviews", json=review_data, cookies=cookies
        )
        assert review_response.status_code == 201
        assert review_response.json()["rating"] == 5

        # List reviews
        list_reviews = test_client.get(f"/api/trips/{trip_id}/reviews")
        assert list_reviews.status_code == 200
        reviews = list_reviews.json()
        assert len(reviews) >= 1

        # Verify in user's reviews
        my_reviews = test_client.get("/auth/my-reviews", cookies=cookies)
        assert my_reviews.status_code == 200
        assert len(my_reviews.json()["trip_reviews"]) >= 1

        # Cleanup
        test_client.delete(f"/api/trips/{trip_id}", cookies=cookies)


class TestReviewDeletion:
    """Integration tests for review deletion workflow."""

    def test_delete_own_program_review(self):
        """Test that users can delete their own program reviews."""
        test_client, cookies, email = get_authenticated_client()

        # Create program and review
        program_response = test_client.post(
            "/api/programs/",
            json={"program_name": "Test", "institution": "Test", "city": "Test", "country": "Test"},
            cookies=cookies,
        )
        program_id = program_response.json()["id"]

        review_response = test_client.post(
            f"/api/programs/{program_id}/reviews",
            json={"rating": 5, "review_text": "Great!"},
            cookies=cookies,
        )
        review_id = review_response.json()["id"]

        # Delete the review
        delete_response = test_client.delete(
            f"/auth/my-reviews/program/{review_id}", cookies=cookies
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["ok"] is True

        # Cleanup
        test_client.delete(f"/api/programs/{program_id}", cookies=cookies)

    def test_cannot_delete_others_review(self):
        """Test that users cannot delete other users' reviews."""
        # Create first user and review
        test_client1, cookies1, email1 = get_authenticated_client()
        program_response = test_client1.post(
            "/api/programs/",
            json={"program_name": "Test", "institution": "Test", "city": "Test", "country": "Test"},
            cookies=cookies1,
        )
        program_id = program_response.json()["id"]

        review_response = test_client1.post(
            f"/api/programs/{program_id}/reviews",
            json={"rating": 5, "review_text": "Great!"},
            cookies=cookies1,
        )
        review_id = review_response.json()["id"]

        # Create second user and try to delete first user's review
        test_client2, cookies2, email2 = get_authenticated_client()
        delete_response = test_client2.delete(
            f"/auth/my-reviews/program/{review_id}", cookies=cookies2
        )
        assert delete_response.status_code == 403

        # Cleanup
        test_client1.delete(f"/api/programs/{program_id}", cookies=cookies1)
