"""
Tests for tickets app.
"""

from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient

from apps.lotteries.models import Draw, Lottery, PrizeTier
from apps.tickets.models import (
    UserBetLine,
    UserTicket,
)
from apps.tickets.services import TicketCheckService

User = get_user_model()


@pytest.fixture
def user(db):
    """Create a test user."""
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
    )


@pytest.fixture
def api_client(user):
    """Create authenticated API client."""
    client = APIClient()
    client.force_authenticate(user=user)
    return client


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
    """Create a test draw with prize tiers."""
    draw = Draw.objects.create(
        lottery=lottery,
        number=2954,
        draw_date="2025-12-20",
        numbers=[1, 9, 37, 39, 42, 44],
        is_accumulated=True,
        accumulated_value=249261580.92,
    )

    # Create prize tiers
    PrizeTier.objects.create(
        draw=draw, tier=1, description="6 acertos", matches=6,
        winners_count=0, prize_value=Decimal("0")
    )
    PrizeTier.objects.create(
        draw=draw, tier=2, description="5 acertos", matches=5,
        winners_count=38, prize_value=Decimal("69615.66")
    )
    PrizeTier.objects.create(
        draw=draw, tier=3, description="4 acertos", matches=4,
        winners_count=4069, prize_value=Decimal("1071.64")
    )

    return draw


@pytest.fixture
def ticket(db, user, lottery):
    """Create a test ticket with bet lines."""
    ticket = UserTicket.objects.create(
        user=user,
        lottery=lottery,
        name="Meu Bilhete",
        numbers_per_bet=6,
        is_active=True,
    )

    # Line with 4 hits: 1, 9, 37, 39 (missing 42, 44)
    UserBetLine.objects.create(
        ticket=ticket,
        numbers=[1, 9, 37, 39, 50, 55],
        order=0,
    )

    # Line with 2 hits: 1, 9
    UserBetLine.objects.create(
        ticket=ticket,
        numbers=[1, 9, 10, 11, 12, 13],
        order=1,
    )

    # Line with 0 hits
    UserBetLine.objects.create(
        ticket=ticket,
        numbers=[2, 3, 4, 5, 6, 7],
        order=2,
    )

    return ticket


@pytest.mark.django_db
class TestCheckService:
    """Test ticket check service."""

    def test_check_ticket(self, ticket, draw):
        """Test checking a ticket against a draw."""
        service = TicketCheckService()
        result = service.check_ticket(ticket, draw)

        assert result.ticket == ticket
        assert result.draw == draw
        assert result.best_hits == 4
        assert result.winning_lines_count == 1
        assert result.total_prize == Decimal("1071.64")
        assert result.best_tier == 3

    def test_check_ticket_line_results(self, ticket, draw):
        """Test that line results are created correctly."""
        service = TicketCheckService()
        result = service.check_ticket(ticket, draw)

        line_results = list(result.line_results.order_by("bet_line__order"))

        # Line 1: 4 hits
        assert line_results[0].hits == 4
        assert set(line_results[0].hit_numbers) == {1, 9, 37, 39}
        assert line_results[0].prize_value == Decimal("1071.64")

        # Line 2: 2 hits (no prize)
        assert line_results[1].hits == 2
        assert set(line_results[1].hit_numbers) == {1, 9}
        assert line_results[1].prize_value == Decimal("0")

        # Line 3: 0 hits
        assert line_results[2].hits == 0
        assert line_results[2].hit_numbers == []

    def test_check_ticket_already_checked(self, ticket, draw):
        """Test that checking same ticket/draw returns existing result."""
        service = TicketCheckService()

        result1 = service.check_ticket(ticket, draw)
        result2 = service.check_ticket(ticket, draw)

        assert result1.id == result2.id

    def test_check_ticket_wrong_lottery(self, ticket, lottery):
        """Test error when ticket and draw are from different lotteries."""
        other_lottery = Lottery.objects.create(
            name="Quina",
            slug="quina",
            api_identifier="quina",
            numbers_count=5,
            max_number=80,
        )
        other_draw = Draw.objects.create(
            lottery=other_lottery,
            number=1,
            draw_date="2025-12-20",
            numbers=[1, 2, 3, 4, 5],
        )

        service = TicketCheckService()

        with pytest.raises(ValueError, match="different"):
            service.check_ticket(ticket, other_draw)


@pytest.mark.django_db
class TestTicketAPI:
    """Test ticket API endpoints."""

    def test_list_tickets(self, api_client, ticket):
        """Test listing user's tickets."""
        response = api_client.get("/api/tickets/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["count"] == 1
        assert data["results"][0]["name"] == "Meu Bilhete"

    def test_create_ticket(self, api_client, lottery):
        """Test creating a ticket."""
        response = api_client.post("/api/tickets/", {
            "lottery": lottery.id,
            "name": "Novo Bilhete",
            "numbers_per_bet": 6,
            "bet_lines": [
                {"numbers": [1, 2, 3, 4, 5, 6]},
                {"numbers": [10, 20, 30, 40, 50, 60]},
            ],
        }, format="json")

        assert response.status_code == status.HTTP_201_CREATED
        assert UserTicket.objects.count() == 1
        assert UserBetLine.objects.count() == 2

    def test_get_ticket_detail(self, api_client, ticket):
        """Test getting ticket details."""
        response = api_client.get(f"/api/tickets/{ticket.id}/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["bet_lines"]) == 3

    def test_delete_ticket(self, api_client, ticket):
        """Test deleting a ticket."""
        response = api_client.delete(f"/api/tickets/{ticket.id}/")

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert UserTicket.objects.count() == 0

    def test_check_ticket_latest(self, api_client, ticket, draw):
        """Test checking ticket against latest draw."""
        response = api_client.post(f"/api/tickets/{ticket.id}/check/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["best_hits"] == 4
        assert data["winning_lines_count"] == 1

    def test_check_ticket_specific_draw(self, api_client, ticket, draw):
        """Test checking ticket against specific draw."""
        response = api_client.post(
            f"/api/tickets/{ticket.id}/check/",
            {"draw_number": 2954},
            format="json",
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["draw"]["number"] == 2954

    def test_get_check_results(self, api_client, ticket, draw):
        """Test getting check results history."""
        # First check the ticket
        api_client.post(f"/api/tickets/{ticket.id}/check/")

        # Then get results
        response = api_client.get(f"/api/tickets/{ticket.id}/results/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["count"] == 1

    def test_unauthorized_access(self, ticket):
        """Test that unauthenticated requests are rejected."""
        client = APIClient()

        response = client.get("/api/tickets/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_other_user_ticket_not_visible(self, api_client, lottery):
        """Test that users can't see other users' tickets."""
        other_user = User.objects.create_user(
            username="other", email="other@example.com", password="pass123"
        )
        other_ticket = UserTicket.objects.create(
            user=other_user,
            lottery=lottery,
            name="Other's Ticket",
            numbers_per_bet=6,
        )

        response = api_client.get(f"/api/tickets/{other_ticket.id}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND
