"""
Models for stats app.

Defines DrawStatistics model for pre-calculated metrics.
"""

from django.db import models

from apps.lotteries.models import Draw


class DrawStatistics(models.Model):
    """
    Pre-calculated statistics for a specific draw.

    Stores metrics like sum, even/odd count, prime numbers, etc.
    to avoid re-calculation on every request.
    """

    draw = models.OneToOneField(
        Draw,
        on_delete=models.CASCADE,
        related_name="stats",
        verbose_name="Sorteio",
    )

    # Basic Metrics
    sum_value = models.IntegerField(
        verbose_name="Soma",
        help_text="Soma de todas as dezenas",
    )
    even_count = models.PositiveSmallIntegerField(
        verbose_name="Pares",
        help_text="Quantidade de números pares",
    )
    odd_count = models.PositiveSmallIntegerField(
        verbose_name="Ímpares",
        help_text="Quantidade de números ímpares",
    )
    range_value = models.IntegerField(
        verbose_name="Amplitude",
        help_text="Diferença entre o maior e o menor número",
    )

    # Advanced Metrics
    prime_count = models.PositiveSmallIntegerField(
        verbose_name="Primos",
        help_text="Quantidade de números primos",
    )
    consecutive_count = models.PositiveSmallIntegerField(
        verbose_name="Consecutivos",
        help_text="Quantidade de pares consecutivos (ex: 1,2 = 1 par)",
    )
    repeated_from_previous = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Repetidos",
        help_text="Quantidade de números repetidos do concurso anterior",
    )

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Estatística do Sorteio"
        verbose_name_plural = "Estatísticas dos Sorteios"
        ordering = ["-draw__number"]

    def __str__(self):
        return f"Stats - {self.draw}"
