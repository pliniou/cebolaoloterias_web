"""
Basic tests to verify the Django project setup.
"""

import pytest
from django.urls import reverse


@pytest.mark.django_db
class TestAPISetup:
    """Test API setup and basic endpoints."""

    def test_api_docs_accessible(self, client):
        """Test that API documentation is accessible."""
        response = client.get("/api/docs/")
        assert response.status_code == 200

    def test_api_schema_accessible(self, client):
        """Test that OpenAPI schema is accessible."""
        response = client.get("/api/schema/")
        assert response.status_code == 200

    def test_token_endpoint_exists(self, client):
        """Test that token endpoint exists."""
        response = client.post("/api/token/", {})
        # Should return 400 (bad request) not 404
        assert response.status_code != 404

    def test_admin_accessible(self, client):
        """Test that admin is accessible."""
        response = client.get("/admin/login/")
        assert response.status_code == 200
