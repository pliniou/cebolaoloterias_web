"""
Celery tasks for lotteries app.

Background tasks for syncing lottery results from CAIXA API.
"""

import logging
import re

from celery import shared_task
from django.db import transaction

from .clients import CaixaLotteryClient
from .models import Draw, Lottery, PrizeTier

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_lottery_results(self, lottery_slug: str = "megasena") -> dict:
    """
    Synchronize the latest lottery results from CAIXA API.

    Args:
        lottery_slug: Slug of the lottery to sync (default: megasena)

    Returns:
        Dict with sync status and details
    """
    try:
        lottery = Lottery.objects.get(slug=lottery_slug, is_active=True)
    except Lottery.DoesNotExist:
        logger.error(f"Lottery not found: {lottery_slug}")
        return {"status": "error", "message": f"Lottery not found: {lottery_slug}"}

    client = CaixaLotteryClient()

    try:
        result = client.get_latest_result(lottery.api_identifier)
    except Exception as exc:
        logger.error(f"Failed to fetch lottery results: {exc}")
        raise self.retry(exc=exc)

    # Check if draw already exists
    if Draw.objects.filter(lottery=lottery, number=result.number).exists():
        logger.info(f"Draw {result.number} already exists for {lottery.name}")
        return {
            "status": "skipped",
            "message": f"Draw {result.number} already exists",
            "draw_number": result.number,
        }

    # Create draw and prize tiers in a transaction
    with transaction.atomic():
        draw = Draw.objects.create(
            lottery=lottery,
            number=result.number,
            draw_date=result.draw_date,
            numbers=result.numbers,
            numbers_draw_order=result.numbers_draw_order,
            is_accumulated=result.is_accumulated,
            accumulated_value=result.accumulated_value,
            next_draw_estimate=result.next_draw_estimate,
            total_revenue=result.total_revenue,
            location=result.location,
            city_state=result.city_state,
            next_draw_number=result.next_draw_number,
            next_draw_date=result.next_draw_date,
            raw_data=result.raw_data,
        )

        # Create prize tiers
        for tier_data in result.prize_tiers:
            # Extract matches from description (e.g., "6 acertos" -> 6)
            matches = _extract_matches(tier_data["description"])

            PrizeTier.objects.create(
                draw=draw,
                tier=tier_data["tier"],
                description=tier_data["description"],
                matches=matches,
                winners_count=tier_data["winners_count"],
                prize_value=tier_data["prize_value"],
            )

        logger.info(f"Created draw {draw.number} for {lottery.name}")

    return {
        "status": "created",
        "message": f"Created draw {draw.number}",
        "draw_number": draw.number,
        "draw_id": draw.id,
    }


@shared_task
def sync_all_active_lotteries() -> dict:
    """
    Synchronize results for all active lotteries.

    Returns:
        Dict with results for each lottery
    """
    results = {}
    for lottery in Lottery.objects.filter(is_active=True):
        try:
            result = sync_lottery_results(lottery.slug)
            results[lottery.slug] = result
        except Exception as exc:
            logger.error(f"Failed to sync {lottery.slug}: {exc}")
            results[lottery.slug] = {"status": "error", "message": str(exc)}

    return results


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_draw_by_number(self, lottery_slug: str, number: int) -> dict:
    """
    Synchronize a specific draw by number.

    Args:
        lottery_slug: Slug of the lottery
        number: Contest number to sync

    Returns:
        Dict with sync status
    """
    try:
        lottery = Lottery.objects.get(slug=lottery_slug, is_active=True)
    except Lottery.DoesNotExist:
        return {"status": "error", "message": f"Lottery not found: {lottery_slug}"}

    # Check if already exists
    if Draw.objects.filter(lottery=lottery, number=number).exists():
        return {"status": "skipped", "message": f"Draw {number} already exists"}

    client = CaixaLotteryClient()

    try:
        result = client.get_result_by_number(lottery.api_identifier, number)
    except Exception as exc:
        logger.error(f"Failed to fetch draw {number}: {exc}")
        raise self.retry(exc=exc)

    with transaction.atomic():
        draw = Draw.objects.create(
            lottery=lottery,
            number=result.number,
            draw_date=result.draw_date,
            numbers=result.numbers,
            numbers_draw_order=result.numbers_draw_order,
            is_accumulated=result.is_accumulated,
            accumulated_value=result.accumulated_value,
            next_draw_estimate=result.next_draw_estimate,
            total_revenue=result.total_revenue,
            location=result.location,
            city_state=result.city_state,
            next_draw_number=result.next_draw_number,
            next_draw_date=result.next_draw_date,
            raw_data=result.raw_data,
        )

        for tier_data in result.prize_tiers:
            matches = _extract_matches(tier_data["description"])
            PrizeTier.objects.create(
                draw=draw,
                tier=tier_data["tier"],
                description=tier_data["description"],
                matches=matches,
                winners_count=tier_data["winners_count"],
                prize_value=tier_data["prize_value"],
            )

    return {"status": "created", "draw_number": number, "draw_id": draw.id}


def _extract_matches(description: str) -> int | None:
    """Extract number of matches from description string."""
    if not description:
        return None
    # Match patterns like "6 acertos", "5 acertos", etc.
    match = re.search(r"(\d+)\s*acertos?", description.lower())
    if match:
        return int(match.group(1))
    return None
