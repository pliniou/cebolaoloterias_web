"""
Models for generator app.

Defines Preset and GeneratorRun models.
"""

from django.conf import settings
from django.db import models

from apps.lotteries.models import Lottery


class Preset(models.Model):
    """
    Configuration preset for game generation.
    
    Stores a set of constraints/filters (e.g., sum range, even count)
    to be reused for generating games.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generator_presets",
        verbose_name="Usuário",
    )
    lottery = models.ForeignKey(
        Lottery,
        on_delete=models.CASCADE,
        related_name="presets",
        verbose_name="Loteria",
    )
    name = models.CharField(
        max_length=100,
        verbose_name="Nome",
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descrição",
    )
    config = models.JSONField(
        default=dict,
        verbose_name="Configuração",
        help_text="JSON com regras de geração (ex: {'min_sum': 100, 'exclude': [1, 2]})",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Preset de Geração"
        verbose_name_plural = "Presets de Geração"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.lottery.name})"


class GeneratorRun(models.Model):
    """
    Record of a generation run.
    
    Stores the output of a game generation request.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="generator_runs",
        verbose_name="Usuário",
    )
    preset = models.ForeignKey(
        Preset,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="runs",
        verbose_name="Preset utilizado",
    )
    lottery = models.ForeignKey(
        Lottery,
        on_delete=models.CASCADE,
        related_name="generator_runs",
        verbose_name="Loteria",
    )
    count = models.PositiveIntegerField(
        verbose_name="Quantidade",
        help_text="Quantidade de jogos solicitados",
    )
    result = models.JSONField(
        default=list,
        verbose_name="Resultado",
        help_text="Lista de jogos gerados com seus metadados",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Execução do Gerador"
        verbose_name_plural = "Execuções do Gerador"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Run {self.id} - {self.lottery.name} ({self.created_at})"
