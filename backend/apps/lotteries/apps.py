"""
Lotteries app configuration.
"""

from django.apps import AppConfig


class LotteriesConfig(AppConfig):
    """Configuration for the lotteries app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.lotteries"
    verbose_name = "Loterias"
