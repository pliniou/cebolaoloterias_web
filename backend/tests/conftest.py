"""
Pytest configuration and fixtures for Cebola Loterias.
"""

import pytest
from django.test import Client
from rest_framework.test import APIClient


@pytest.fixture
def client():
    """Django test client fixture."""
    return Client()


@pytest.fixture
def api_client():
    """DRF API test client fixture."""
    return APIClient()


@pytest.fixture
def authenticated_api_client(api_client, django_user_model):
    """Authenticated API client fixture."""
    user = django_user_model.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
    )
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def user(django_user_model):
    """Create a test user."""
    return django_user_model.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
    )
