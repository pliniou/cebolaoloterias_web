"""
Generator app configuration.
"""

from django.apps import AppConfig


class GeneratorConfig(AppConfig):
    """Configuration for the generator app."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.generator"
    verbose_name = "Gerador de Jogos"
