"""
Tests for generator app.
"""

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.generator.engine.validators import (
    EvenOddValidator,
    ExclusionValidator,
    SumValidator,
)
from apps.generator.models import GeneratorRun, Preset
from apps.lotteries.models import Lottery

User = get_user_model()


class TestValidators:
    """Test individual validators."""

    def test_sum_validator(self):
        v = SumValidator(min_sum=10, max_sum=20)
        assert v.validate([1, 2, 3, 4]) # 10 -> OK
        assert v.validate([5, 5, 5])    # 15 -> OK
        assert v.validate([10, 10])     # 20 -> OK
        assert not v.validate([1, 2, 3]) # 6 -> Too low
        assert not v.validate([10, 10, 5]) # 25 -> Too high

    def test_even_odd_validator(self):
        v = EvenOddValidator(min_even=2, max_even=3)
        assert v.validate([2, 4, 1, 3]) # 2 evens -> OK
        assert v.validate([2, 4, 6, 1]) # 3 evens -> OK
        assert not v.validate([2, 1, 3, 5]) # 1 even -> Too low
        assert not v.validate([2, 4, 6, 8]) # 4 evens -> Too high

    def test_exclusion_validator(self):
        v = ExclusionValidator([1, 2, 3])
        assert v.validate([4, 5, 6]) # OK
        assert not v.validate([1, 4, 5]) # 1 present -> Fail
        assert not v.validate([3, 10]) # 3 present -> Fail


@pytest.fixture
def user(db):
    return User.objects.create_user(username="genuser", password="password")

@pytest.fixture
def lottery(db):
    return Lottery.objects.create(
        name="Mega-Sena",
        slug="megasena",
        api_identifier="megasena",
        numbers_count=6,
        min_number=1,
        max_number=60,
    )

@pytest.fixture
def client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


@pytest.mark.django_db
class TestGeneratorAPI:
    """Test generator API endpoints."""

    def test_create_preset(self, client, lottery):
        """Test creating a preset."""
        response = client.post("/api/generator/presets/", {
            "name": "My Strategy",
            "lottery": lottery.id,
            "config": {"min_sum": 100, "max_sum": 200}
        }, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert Preset.objects.count() == 1
        assert Preset.objects.first().config["min_sum"] == 100

    def test_run_preset(self, client, lottery):
        """Test running a generator from a preset."""
        # Create preset
        preset = Preset.objects.create(
            user=User.objects.first(),
            lottery=lottery,
            name="Test",
            config={"min_even": 3, "max_even": 3} # Strictly 3 evens
        )

        response = client.post(f"/api/generator/presets/{preset.id}/run/", {
            "count": 5
        }, format="json")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["result"]) == 5

        # Check generated games
        for game in data["result"]:
            numbers = game["numbers"]
            evens = sum(1 for n in numbers if n % 2 == 0)
            assert evens == 3

        assert GeneratorRun.objects.count() == 1

    def test_adhoc_run(self, client, lottery):
        """Test ad-hoc generation."""
        response = client.post("/api/generator/runs/", {
            "lottery_id": lottery.id,
            "count": 2,
            "config": {
                "fixed_numbers": [1, 2, 3],
                "numbers_count": 6
            }
        }, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        results = data["result"]

        assert len(results) == 2
        for game in results:
            assert {1, 2, 3}.issubset(set(game["numbers"]))

    def test_impossible_config(self, client, lottery):
        """Test generator error handling."""
        # Impossible to have 0 sum with positive numbers
        response = client.post("/api/generator/runs/", {
            "lottery_id": lottery.id,
            "count": 1,
            "config": {"max_sum": 5} # Min sum for Mega is 1+2+3+4+5+6 = 21
        }, format="json")

        # The generator will likely timeout/exhaust attempts and return fewer or 0 games
        # Or if validation happens before loop, it might return empty list
        # Current implementation loops MAX_ATTEMPTS then returns whatever it got

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        # Should be empty or successful if randomness somehow found a bug (unlikely)
        assert len(data["result"]) == 0
