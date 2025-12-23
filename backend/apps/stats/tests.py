"""
Tests for stats app.
"""


import pytest
from rest_framework import status

from apps.lotteries.models import Draw, Lottery
from apps.stats.models import DrawStatistics
from apps.stats.services.calculator import StatsCalculator


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
def draws(db, lottery):
    """Create a sequence of draws for testing."""
    draws = []
    # Draw 1: [2, 4, 6, 8, 10, 12] (All even, consecutive)
    d1 = Draw.objects.create(
        lottery=lottery,
        number=1,
        draw_date="2025-01-01",
        numbers=[2, 4, 6, 8, 10, 12],
    )
    # Trigger signal should create stats
    draws.append(d1)

    # Draw 2: [1, 3, 5, 7, 11, 13] (All odd, all primes)
    d2 = Draw.objects.create(
        lottery=lottery,
        number=2,
        draw_date="2025-01-02",
        numbers=[1, 3, 5, 7, 11, 13],
    )
    draws.append(d2)

    # Draw 3: [1, 2, 3, 4, 5, 6] (Mixed)
    d3 = Draw.objects.create(
        lottery=lottery,
        number=3,
        draw_date="2025-01-03",
        numbers=[1, 2, 3, 4, 5, 6],
    )
    draws.append(d3)

    return draws

class TestStatsCalculator:
    """Test mathematical logic."""

    def test_calculate_metrics(self):
        numbers = [2, 3, 5, 7, 11, 13] # All primes
        metrics = StatsCalculator.calculate_metrics(numbers)

        assert metrics["sum_value"] == 41
        assert metrics["even_count"] == 1 # 2
        assert metrics["odd_count"] == 5
        assert metrics["prime_count"] == 6
        assert metrics["range_value"] == 11 # 13-2
        assert metrics["consecutive_count"] == 1 # 2,3

    def test_prime_check(self):
        assert StatsCalculator.is_prime(2)
        assert StatsCalculator.is_prime(3)
        assert StatsCalculator.is_prime(17)
        assert not StatsCalculator.is_prime(4)
        assert not StatsCalculator.is_prime(1)

    def test_repeated_numbers(self):
        prev = [1, 2, 3, 4, 5, 6]
        curr = [4, 5, 6, 7, 8, 9]
        count = StatsCalculator.count_repeated(curr, prev)
        assert count == 3 # 4, 5, 6


@pytest.mark.django_db
class TestStatsIntegration:
    """Test database integration and signals."""

    def test_stats_creation_on_draw_save(self, lottery):
        """Test that stats are computed via Task/Signal when draw is saved."""
        # Note: In tests with CELERY_TASK_ALWAYS_EAGER = True (default pytest-django),
        # tasks run synchronously.

        draw = Draw.objects.create(
            lottery=lottery,
            number=1,
            draw_date="2025-01-01",
            numbers=[2, 3, 5, 7, 11, 13],
        )

        # Verify stats created
        assert DrawStatistics.objects.filter(draw=draw).exists()

        stats = draw.stats
        assert stats.prime_count == 6
        assert stats.sum_value == 41

    def test_api_aggregated_stats(self, db, client, draws, lottery):
        """Test the aggregated stats endpoint."""

        response = client.get(f"/api/stats/{lottery.slug}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["total_analyzed"] == 3

        # Check averages
        avgs = data["averages"]
        # Evens: Draw1=6, Draw2=0, Draw3=3 -> Avg = 3.0
        assert avgs["evens"] == 3.0

        # Check frequencies
        freqs = data["number_frequencies"]
        # Number 1 appears in Draw 2 and 3
        num_1 = next(f for f in freqs if f["number"] == 1)
        assert num_1["count"] == 2

    def test_api_window_filter(self, db, client, draws, lottery):
        """Test window parameter."""
        # Only last 1 draw
        response = client.get(f"/api/stats/{lottery.slug}/?window=1")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_analyzed"] == 1

        # Should be stats from Draw 3 only [1,2,3,4,5,6]
        assert data["averages"]["sum"] == 21.0
