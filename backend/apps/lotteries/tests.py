"""
Tests for lotteries app.
"""

import pytest
from rest_framework import status

from apps.lotteries.clients.caixa import CaixaLotteryClient
from django.db import IntegrityError
from apps.lotteries.models import Draw, Lottery, PrizeTier


@pytest.fixture
def lottery(db):
    """Create a test lottery."""
    return Lottery.objects.create(
        name="Mega-Sena",
        slug="megasena",
        api_identifier="megasena",
        numbers_count=6,
        min_number=1,
        max_number=60,
        color="#209869",
        is_active=True,
    )


@pytest.fixture
def draw(db, lottery):
    """Create a test draw."""
    draw = Draw.objects.create(
        lottery=lottery,
        number=2954,
        draw_date="2025-12-20",
        numbers=[1, 9, 37, 39, 42, 44],
        numbers_draw_order=[37, 1, 42, 44, 39, 9],
        is_accumulated=True,
        accumulated_value=249261580.92,
        next_draw_estimate=1000000000.00,
        total_revenue=66385644.00,
        location="ESPAÇO DA SORTE",
        city_state="SÃO PAULO, SP",
    )

    # Create prize tiers
    PrizeTier.objects.create(
        draw=draw, tier=1, description="6 acertos", matches=6, winners_count=0, prize_value=0
    )
    PrizeTier.objects.create(
        draw=draw, tier=2, description="5 acertos", matches=5, winners_count=38, prize_value=69615.66
    )
    PrizeTier.objects.create(
        draw=draw, tier=3, description="4 acertos", matches=4, winners_count=4069, prize_value=1071.64
    )

    return draw


@pytest.mark.django_db
class TestLotteryAPI:
    """Test lottery API endpoints."""

    def test_list_lotteries(self, client, lottery):
        """Test listing lotteries."""
        response = client.get("/api/lotteries/")

        assert response.status_code == status.HTTP_200_OK
        assert len(response.json()) == 1
        assert response.json()[0]["slug"] == "megasena"

    def test_lottery_detail(self, client, lottery):
        """Test getting lottery details."""
        response = client.get(f"/api/lotteries/{lottery.slug}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["name"] == "Mega-Sena"
        assert response.json()["numbers_count"] == 6

    def test_lottery_not_found(self, client):
        """Test 404 for non-existent lottery."""
        response = client.get("/api/lotteries/nonexistent/")

        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestDrawAPI:
    """Test draw API endpoints."""

    def test_latest_draw(self, client, draw):
        """Test getting latest draw."""
        response = client.get(f"/api/lotteries/{draw.lottery.slug}/latest/")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["number"] == 2954
        assert response.json()["numbers"] == [1, 9, 37, 39, 42, 44]
        assert len(response.json()["prize_tiers"]) == 3

    def test_latest_draw_no_draws(self, client, lottery):
        """Test 404 when no draws exist."""
        response = client.get(f"/api/lotteries/{lottery.slug}/latest/")

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_draw_by_number(self, client, draw):
        """Test getting draw by number."""
        response = client.get(f"/api/lotteries/{draw.lottery.slug}/draws/{draw.number}/")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["number"] == 2954

    def test_draw_list(self, client, draw):
        """Test listing draws with pagination."""
        response = client.get(f"/api/lotteries/{draw.lottery.slug}/draws/")

        assert response.status_code == status.HTTP_200_OK
        assert response.json()["count"] == 1
        assert len(response.json()["results"]) == 1


@pytest.mark.django_db
class TestModels:
    """Test model methods and properties."""

    def test_lottery_str(self, lottery):
        """Test lottery string representation."""
        assert str(lottery) == "Mega-Sena"

    def test_draw_str(self, draw):
        """Test draw string representation."""
        assert str(draw) == "Mega-Sena - Concurso 2954"

    def test_prize_tier_str(self, draw):
        """Test prize tier string representation."""
        tier = draw.prize_tiers.first()
        assert "Mega-Sena" in str(tier)
        assert "acertos" in str(tier)

    def test_draw_unique_together(self, lottery, draw):
        """Test that lottery + number must be unique."""
        with pytest.raises(IntegrityError):
            Draw.objects.create(
                lottery=lottery,
                number=2954,  # Same as existing
                draw_date="2025-12-21",
                numbers=[1, 2, 3, 4, 5, 6],
            )


class TestCaixaClient:
    """Test CAIXA API client."""

    def test_parse_date(self):
        """Test date parsing."""
        client = CaixaLotteryClient()

        result = client._parse_date("20/12/2025")
        assert result.year == 2025
        assert result.month == 12
        assert result.day == 20

    def test_parse_date_invalid(self):
        """Test invalid date returns None."""
        client = CaixaLotteryClient()

        result = client._parse_date("invalid")
        assert result is None

    def test_parse_numbers(self):
        """Test number parsing."""
        client = CaixaLotteryClient()

        result = client._parse_numbers(["01", "09", "37", "39", "42", "44"])
        assert result == [1, 9, 37, 39, 42, 44]

    def test_parse_numbers_empty(self):
        """Test empty list returns empty."""
        client = CaixaLotteryClient()

        result = client._parse_numbers([])
        assert result == []
