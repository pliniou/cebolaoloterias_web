"""
Ticket check service.

Service for checking user tickets against lottery draws.
"""

import logging
from dataclasses import dataclass
from decimal import Decimal

from django.db import transaction

from apps.lotteries.models import Draw, PrizeTier
from apps.tickets.models import LineCheckResult, TicketCheckResult, UserTicket

logger = logging.getLogger(__name__)


@dataclass
class LineResult:
    """Result of checking a single line."""

    bet_line_id: int
    hits: int
    hit_numbers: list[int]
    prize_tier: PrizeTier | None
    prize_value: Decimal


class TicketCheckService:
    """
    Service for checking user tickets against lottery draws.
    
    Usage:
        service = TicketCheckService()
        result = service.check_ticket(ticket, draw)
        result = service.check_ticket_latest(ticket)
    """

    def check_ticket(self, ticket: UserTicket, draw: Draw) -> TicketCheckResult:
        """
        Check a ticket against a specific draw.
        
        Args:
            ticket: The user ticket to check
            draw: The draw to check against
            
        Returns:
            TicketCheckResult with all line results
            
        Raises:
            ValueError: If ticket and draw are for different lotteries
            ValueError: If the ticket has already been checked against this draw
        """
        # Validate lottery match
        if ticket.lottery_id != draw.lottery_id:
            raise ValueError(
                f"Ticket is for {ticket.lottery.name} but draw is for {draw.lottery.name}"
            )

        # Check if already checked
        existing = TicketCheckResult.objects.filter(ticket=ticket, draw=draw).first()
        if existing:
            logger.info(f"Ticket {ticket.id} already checked against draw {draw.number}")
            return existing

        # Get prize tiers for this draw, indexed by matches
        prize_tiers = self._build_prize_tier_map(draw)

        # Check each line
        line_results: list[LineResult] = []
        for bet_line in ticket.bet_lines.all():
            result = self._check_line(bet_line.numbers, draw.numbers, prize_tiers)
            line_results.append(
                LineResult(
                    bet_line_id=bet_line.id,
                    hits=result["hits"],
                    hit_numbers=result["hit_numbers"],
                    prize_tier=result["prize_tier"],
                    prize_value=result["prize_value"],
                )
            )

        # Persist results
        return self._persist_results(ticket, draw, line_results)

    def check_ticket_latest(self, ticket: UserTicket) -> TicketCheckResult:
        """
        Check a ticket against the latest draw of its lottery.
        
        Args:
            ticket: The user ticket to check
            
        Returns:
            TicketCheckResult
            
        Raises:
            ValueError: If no draws exist for the lottery
        """
        latest_draw = Draw.objects.filter(lottery=ticket.lottery).first()
        if not latest_draw:
            raise ValueError(f"No draws found for {ticket.lottery.name}")

        return self.check_ticket(ticket, latest_draw)

    def check_ticket_by_draw_number(
        self, ticket: UserTicket, draw_number: int
    ) -> TicketCheckResult:
        """
        Check a ticket against a specific draw number.
        
        Args:
            ticket: The user ticket to check
            draw_number: The draw/contest number
            
        Returns:
            TicketCheckResult
            
        Raises:
            ValueError: If draw not found
        """
        try:
            draw = Draw.objects.get(lottery=ticket.lottery, number=draw_number)
        except Draw.DoesNotExist:
            raise ValueError(
                f"Draw {draw_number} not found for {ticket.lottery.name}"
            )

        return self.check_ticket(ticket, draw)

    def _check_line(
        self,
        bet_numbers: list[int],
        draw_numbers: list[int],
        prize_tiers: dict[int, PrizeTier],
    ) -> dict:
        """
        Check a single line against draw numbers.
        
        Args:
            bet_numbers: Numbers the user bet on
            draw_numbers: Numbers drawn in the lottery
            prize_tiers: Map of hits count to prize tier
            
        Returns:
            Dict with hits, hit_numbers, prize_tier, prize_value
        """
        bet_set = set(bet_numbers)
        draw_set = set(draw_numbers)

        hit_numbers = sorted(bet_set & draw_set)
        hits = len(hit_numbers)

        # Find prize tier for this number of hits
        prize_tier = prize_tiers.get(hits)
        prize_value = prize_tier.prize_value if prize_tier else Decimal("0")

        return {
            "hits": hits,
            "hit_numbers": hit_numbers,
            "prize_tier": prize_tier,
            "prize_value": prize_value,
        }

    def _build_prize_tier_map(self, draw: Draw) -> dict[int, PrizeTier]:
        """
        Build a map of hits count to prize tier.
        
        Args:
            draw: The draw to get prize tiers from
            
        Returns:
            Dict mapping number of hits to PrizeTier
        """
        prize_map = {}
        for tier in draw.prize_tiers.all():
            if tier.matches is not None:
                prize_map[tier.matches] = tier
        return prize_map

    @transaction.atomic
    def _persist_results(
        self,
        ticket: UserTicket,
        draw: Draw,
        line_results: list[LineResult],
    ) -> TicketCheckResult:
        """
        Persist check results to database.
        
        Args:
            ticket: The checked ticket
            draw: The draw checked against
            line_results: Results for each line
            
        Returns:
            Created TicketCheckResult
        """
        # Calculate aggregates
        total_prize = sum(r.prize_value for r in line_results)
        best_hits = max((r.hits for r in line_results), default=0)
        winning_lines = [r for r in line_results if r.prize_tier is not None]
        winning_lines_count = len(winning_lines)

        # Find best tier (lowest tier number = best)
        best_tier = None
        if winning_lines:
            best_tier = min(r.prize_tier.tier for r in winning_lines)

        # Create check result
        check_result = TicketCheckResult.objects.create(
            ticket=ticket,
            draw=draw,
            total_prize=total_prize,
            best_tier=best_tier,
            best_hits=best_hits,
            winning_lines_count=winning_lines_count,
        )

        # Create line results
        line_result_objects = []
        for result in line_results:
            line_result_objects.append(
                LineCheckResult(
                    check_result=check_result,
                    bet_line_id=result.bet_line_id,
                    hits=result.hits,
                    hit_numbers=result.hit_numbers,
                    prize_tier=result.prize_tier,
                    prize_value=result.prize_value,
                )
            )

        LineCheckResult.objects.bulk_create(line_result_objects)

        logger.info(
            f"Checked ticket {ticket.id} against draw {draw.number}: "
            f"{best_hits} max hits, {winning_lines_count} winning lines, "
            f"R$ {total_prize} total prize"
        )

        return check_result
