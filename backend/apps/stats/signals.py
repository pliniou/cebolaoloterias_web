"""
Signals for stats app.

Triggers computation when draws are created.
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.lotteries.models import Draw
from apps.stats.tasks import compute_stats_for_draw


@receiver(post_save, sender=Draw)
def trigger_stats_computation(sender, instance, created, **kwargs):
    """Trigger stats task when a Draw is saved."""
    # We trigger even on updates to ensure stats are in sync with numbers
    compute_stats_for_draw.delay(instance.id)
