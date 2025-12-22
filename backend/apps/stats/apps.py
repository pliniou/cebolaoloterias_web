"""
Stats app configuration.
"""

from django.apps import AppConfig


class StatsConfig(AppConfig):
    """Configuration for the stats app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.stats"
    verbose_name = "Estatísticas"

    def ready(self):
        """Import signals when app is ready."""
        import apps.stats.signals  # noqa: F401
