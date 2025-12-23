"""
Celery tasks for stats app.
"""

import logging

from celery import shared_task
from django.db import transaction

from apps.lotteries.models import Draw
from apps.stats.models import DrawStatistics
from apps.stats.services.calculator import StatsCalculator
from apps.stats.services.manager import StatsManager

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def compute_stats_for_draw(self, draw_id: int):
    """
    Compute statistics for a specific draw and persist them.

    Args:
        draw_id: ID of the Draw object
    """
    try:
        draw = Draw.objects.get(id=draw_id)
    except Draw.DoesNotExist:
        logger.error(f"Draw {draw_id} not found.")
        return

    # Fetch previous draw for comparison
    previous_draw = Draw.objects.filter(
        lottery=draw.lottery,
        number=draw.number - 1
    ).first()

    previous_numbers = previous_draw.numbers if previous_draw else None

    # Calculate metrics
    metrics = StatsCalculator.calculate_metrics(draw.numbers, previous_numbers)

    # Persist
    with transaction.atomic():
        stats, created = DrawStatistics.objects.update_or_create(
            draw=draw,
            defaults=metrics
        )

    logger.info(f"Stats computed for Draw {draw.id} ({draw.lottery.slug} #{draw.number})")

    # Invalidate caches
    manager = StatsManager()
    manager.invalidate_cache(draw.lottery.slug)

@shared_task
def recompute_all_stats():
    """Recompute stats for all existing draws."""
    draws = Draw.objects.all()
    count = 0
    for draw in draws:
        compute_stats_for_draw.delay(draw.id)
        count += 1

    logger.info(f"Queued stats computation for {count} draws.")
