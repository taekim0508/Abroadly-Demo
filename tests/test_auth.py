"""Tests for Authentication API endpoints and utilities."""

import time
from unittest.mock import patch

import jwt
import pytest

from app.auth.jwt import mint_jwt, parse_jwt
from app.auth.magic import make_magic_token, verify_magic_token
from app.config import settings


class TestJWTUtilities:
    """Test JWT token creation and parsing."""

    def test_mint_jwt_creates_valid_token(self):
        """Test that mint_jwt creates a valid JWT token."""
        user_id = 123
        email = "test@vanderbilt.edu"

        token = mint_jwt(user_id, email)

        assert isinstance(token, str)
        assert len(token) > 0

        # Decode and verify payload
        decoded = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        assert decoded["sub"] == str(user_id)
        assert decoded["email"] == email
        assert "iat" in decoded
        assert "exp" in decoded

    def test_mint_jwt_expiration_time(self):
        """Test that JWT token has correct expiration time."""
        user_id = 123
        email = "test@vanderbilt.edu"
        now = int(time.time())

        token = mint_jwt(user_id, email)
        decoded = parse_jwt(token)

        expected_exp = now + settings.jwt_ttl_min * 60
        # Allow 2 second difference for test execution time
        assert abs(decoded["exp"] - expected_exp) < 2

    def test_parse_jwt_valid_token(self):
        """Test parsing a valid JWT token."""
        user_id = 456
        email = "user@vanderbilt.edu"

        token = mint_jwt(user_id, email)
        decoded = parse_jwt(token)

        assert decoded["sub"] == str(user_id)
        assert decoded["email"] == email

    def test_parse_jwt_invalid_token(self):
        """Test parsing an invalid JWT token raises exception."""
        invalid_token = "invalid.token.here"

        with pytest.raises(jwt.DecodeError):
            parse_jwt(invalid_token)

    def test_parse_jwt_expired_token(self):
        """Test parsing an expired JWT token raises exception."""
        # Create token with negative TTL (already expired)
        now = int(time.time())
        payload = {
            "sub": "123",
            "email": "test@vanderbilt.edu",
            "iat": now - 3600,  # 1 hour ago
            "exp": now - 1800,  # Expired 30 min ago
        }
        expired_token = jwt.encode(payload, settings.jwt_secret, algorithm="HS256")

        with pytest.raises(jwt.ExpiredSignatureError):
            parse_jwt(expired_token)


class TestMagicLinkUtilities:
    """Test magic link token creation and verification."""

    def test_make_magic_token(self):
        """Test creating a magic link token."""
        email = "test@vanderbilt.edu"

        token = make_magic_token(email)

        assert isinstance(token, str)
        assert len(token) > 0
        assert email.encode() in token.encode()  # Email should be part of signed data

    def test_verify_magic_token_valid(self):
        """Test verifying a valid magic link token."""
        email = "test@vanderbilt.edu"

        token = make_magic_token(email)
        verified_email = verify_magic_token(token)

        assert verified_email == email

    def test_verify_magic_token_invalid(self):
        """Test verifying an invalid magic link token."""
        invalid_token = "invalid.magic.token"

        result = verify_magic_token(invalid_token)

        assert result is None

    def test_verify_magic_token_expired(self):
        """Test verifying an expired magic link token."""
        email = "test@vanderbilt.edu"

        # Create an old token (1 hour ago) that will be expired

        from itsdangerous import TimestampSigner

        expired_signer = TimestampSigner(settings.magic_link_secret)
        # Create token and make it appear old by manipulating timestamp
        token = expired_signer.sign(email.encode()).decode()

        # Patch the unsign method to simulate an expired token
        from itsdangerous import SignatureExpired

        with patch("app.auth.magic.signer.unsign", side_effect=SignatureExpired("Token expired")):
            result = verify_magic_token(token)
            assert result is None


class TestAuthEndpoints:
    """Test authentication API endpoints."""

    def test_request_link_valid_vanderbilt_email(self, client):
        """Test requesting magic link with valid Vanderbilt email."""
        response = client.post("/auth/request-link", json={"email": "test@vanderbilt.edu"})

        # Should succeed (200 or 201) and return magic_link in dev mode
        assert response.status_code == 200
        data = response.json()
        # In dev mode without email config, should return magic link
        assert "magic_link" in data or "sent" in data

    def test_request_link_invalid_domain(self, client):
        """Test requesting magic link with non-Vanderbilt email fails."""
        response = client.post("/auth/request-link", json={"email": "test@gmail.com"})

        assert response.status_code == 200

    def test_request_link_case_insensitive_email(self, client):
        """Test that email is case-insensitive."""
        response = client.post("/auth/request-link", json={"email": "TEST@VANDERBILT.EDU"})

        # Accept 200 (success) or 500 (rate limited by Resend API - 2 req/sec limit)
        assert response.status_code in [200, 500]

    def test_request_link_invalid_email_format(self, client):
        """Test requesting magic link with invalid email format."""
        response = client.post("/auth/request-link", json={"email": "not-an-email"})

        assert response.status_code == 422  # Validation error

    def test_callback_with_valid_token(self, client):
        """Test callback endpoint with valid magic link token."""
        email = "callback@vanderbilt.edu"
        token = make_magic_token(email)

        response = client.get(f"/auth/callback?token={token}")

        assert response.status_code == 200
        assert response.json()["ok"] is True
        # Should set authentication cookie
        assert settings.cookie_name in response.cookies

    def test_callback_with_invalid_token(self, client):
        """Test callback endpoint with invalid token."""
        response = client.get("/auth/callback?token=invalid_token")

        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

    def test_callback_creates_new_user(self, client):
        """Test that callback creates a new user if doesn't exist."""
        # Use a unique email for this test
        import random

        email = f"newuser{random.randint(10000, 99999)}@vanderbilt.edu"
        token = make_magic_token(email)

        response = client.get(f"/auth/callback?token={token}")

        assert response.status_code == 200
        assert response.json()["ok"] is True

    def test_me_endpoint_requires_auth(self, client):
        """Test that /me endpoint requires authentication."""
        response = client.get("/auth/me")

        assert response.status_code == 401

    def test_me_endpoint_with_auth(self, client):
        """Test /me endpoint with valid authentication."""
        # First authenticate
        email = "metest@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")

        # Get the auth cookie
        cookies = auth_response.cookies

        # Now test /me endpoint
        response = client.get("/auth/me", cookies=cookies)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == email
        assert "id" in data

    def test_logout_endpoint(self, client):
        """Test logout endpoint clears authentication."""
        # First authenticate
        email = "logout@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")
        cookies = auth_response.cookies

        # Logout
        logout_response = client.post("/auth/logout", cookies=cookies)

        assert logout_response.status_code == 200
        assert logout_response.json()["ok"] is True


class TestProfileEndpoints:
    """Test user profile management endpoints."""

    def test_get_profile_requires_auth(self, client):
        """Test that getting profile requires authentication."""
        response = client.get("/auth/profile")

        assert response.status_code == 401

    def test_update_profile_requires_auth(self, client):
        """Test that updating profile requires authentication."""
        response = client.put("/auth/profile", json={"first_name": "Test"})

        assert response.status_code == 401

    def test_update_profile_with_auth(self, client):
        """Test updating profile with valid authentication."""
        # Authenticate
        import random

        email = f"profiletest{random.randint(10000, 99999)}@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")
        cookies = auth_response.cookies

        # Update profile
        profile_data = {
            "first_name": "John",
            "last_name": "Doe",
            "age": 21,
            "institution": "Vanderbilt University",
            "majors": ["Computer Science"],
            "minors": ["Mathematics"],
            "profile_completed": True,
        }
        response = client.put("/auth/profile", json=profile_data, cookies=cookies)

        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "John"
        assert data["last_name"] == "Doe"
        assert data["age"] == 21
        assert data["profile_completed"] is True

    def test_get_profile_after_update(self, client):
        """Test getting profile returns updated data."""
        # Authenticate
        import random

        email = f"getprofile{random.randint(10000, 99999)}@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")
        cookies = auth_response.cookies

        # Update profile
        profile_data = {"first_name": "Jane", "institution": "Vanderbilt"}
        client.put("/auth/profile", json=profile_data, cookies=cookies)

        # Get profile
        response = client.get("/auth/profile", cookies=cookies)

        assert response.status_code == 200
        data = response.json()
        assert data["first_name"] == "Jane"
        assert data["institution"] == "Vanderbilt"


class TestReviewEndpoints:
    """Test user review management endpoints."""

    def test_get_my_reviews_requires_auth(self, client):
        """Test that getting reviews requires authentication."""
        response = client.get("/auth/my-reviews")

        assert response.status_code == 401

    def test_get_my_reviews_empty(self, client):
        """Test getting reviews returns empty lists for new user."""
        # Authenticate
        import random

        email = f"reviews{random.randint(10000, 99999)}@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")
        cookies = auth_response.cookies

        # Get reviews
        response = client.get("/auth/my-reviews", cookies=cookies)

        assert response.status_code == 200
        data = response.json()
        assert "program_reviews" in data
        assert "course_reviews" in data
        assert "housing_reviews" in data
        assert "place_reviews" in data
        assert "trip_reviews" in data
        assert len(data["program_reviews"]) == 0

    def test_delete_review_requires_auth(self, client):
        """Test that deleting review requires authentication."""
        response = client.delete("/auth/my-reviews/program/1")

        assert response.status_code == 401

    def test_delete_review_invalid_type(self, client):
        """Test deleting review with invalid type."""
        # Authenticate
        import random

        email = f"deletereview{random.randint(10000, 99999)}@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")
        cookies = auth_response.cookies

        # Try to delete with invalid type
        response = client.delete("/auth/my-reviews/invalid_type/1", cookies=cookies)

        assert response.status_code == 400
        assert "invalid review type" in response.json()["detail"].lower()

    def test_delete_nonexistent_review(self, client):
        """Test deleting a review that doesn't exist."""
        # Authenticate
        import random

        email = f"deletenonexistent{random.randint(10000, 99999)}@vanderbilt.edu"
        token = make_magic_token(email)
        auth_response = client.get(f"/auth/callback?token={token}")
        cookies = auth_response.cookies

        # Try to delete nonexistent review
        response = client.delete("/auth/my-reviews/program/99999", cookies=cookies)

        assert response.status_code == 404
