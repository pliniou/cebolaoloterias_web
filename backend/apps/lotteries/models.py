"""
Models for lotteries app.

Defines Lottery, Draw, and PrizeTier models for storing lottery results.
"""

from django.db import models


class Lottery(models.Model):
    """
    Represents a lottery type (e.g., Mega-Sena, Quina, Lotofácil).

    Each lottery has its own rules for number selection and prize tiers.
    """

    name = models.CharField(
        max_length=100,
        verbose_name="Nome",
        help_text="Nome da loteria (ex: Mega-Sena)",
    )
    slug = models.SlugField(
        unique=True,
        verbose_name="Slug",
        help_text="Identificador URL-friendly (ex: megasena)",
    )
    api_identifier = models.CharField(
        max_length=50,
        verbose_name="Identificador API",
        help_text="Identificador usado na API da CAIXA (ex: megasena)",
    )
    description = models.TextField(
        blank=True,
        verbose_name="Descrição",
    )
    numbers_count = models.PositiveSmallIntegerField(
        verbose_name="Quantidade de números",
        help_text="Quantos números são sorteados (ex: 6 para Mega-Sena)",
    )
    min_number = models.PositiveSmallIntegerField(
        default=1,
        verbose_name="Número mínimo",
    )
    max_number = models.PositiveIntegerField(
        verbose_name="Número máximo",
        help_text="Maior número possível (ex: 60 para Mega-Sena)",
    )
    color = models.CharField(
        max_length=7,
        default="#209869",
        verbose_name="Cor",
        help_text="Cor hexadecimal para UI (ex: #209869)",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Ativa",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Loteria"
        verbose_name_plural = "Loterias"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Draw(models.Model):
    """
    Represents a single draw/contest of a lottery.

    Contains the drawn numbers, date, and accumulated values.
    """

    lottery = models.ForeignKey(
        Lottery,
        on_delete=models.CASCADE,
        related_name="draws",
        verbose_name="Loteria",
    )
    number = models.PositiveIntegerField(
        verbose_name="Número do concurso",
    )
    draw_date = models.DateField(
        verbose_name="Data do sorteio",
    )
    numbers = models.JSONField(
        verbose_name="Números sorteados",
        help_text="Lista de números em ordem crescente",
    )
    numbers_draw_order = models.JSONField(
        null=True,
        blank=True,
        verbose_name="Números na ordem do sorteio",
        help_text="Lista de números na ordem em que foram sorteados",
    )
    is_accumulated = models.BooleanField(
        default=False,
        verbose_name="Acumulado",
    )
    accumulated_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Valor acumulado",
    )
    next_draw_estimate = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Estimativa próximo concurso",
    )
    total_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Arrecadação total",
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Local do sorteio",
    )
    city_state = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Cidade/UF",
    )
    next_draw_number = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Próximo concurso",
    )
    next_draw_date = models.DateField(
        null=True,
        blank=True,
        verbose_name="Data próximo concurso",
    )
    raw_data = models.JSONField(
        default=dict,
        verbose_name="Dados brutos",
        help_text="Resposta completa da API da CAIXA",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Sorteio"
        verbose_name_plural = "Sorteios"
        ordering = ["-number"]
        unique_together = ["lottery", "number"]
        indexes = [
            models.Index(fields=["lottery", "-number"]),
            models.Index(fields=["draw_date"]),
        ]

    def __str__(self):
        return f"{self.lottery.name} - Concurso {self.number}"


class PrizeTier(models.Model):
    """
    Represents a prize tier for a specific draw.

    Each draw can have multiple prize tiers (e.g., 6 matches, 5 matches, 4 matches).
    """

    draw = models.ForeignKey(
        Draw,
        on_delete=models.CASCADE,
        related_name="prize_tiers",
        verbose_name="Sorteio",
    )
    tier = models.PositiveSmallIntegerField(
        verbose_name="Faixa",
        help_text="Número da faixa (1 = maior prêmio)",
    )
    description = models.CharField(
        max_length=100,
        verbose_name="Descrição",
        help_text="Descrição da faixa (ex: 6 acertos)",
    )
    matches = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        verbose_name="Acertos",
        help_text="Número de acertos para esta faixa",
    )
    winners_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Quantidade de ganhadores",
    )
    prize_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Valor do prêmio",
    )

    class Meta:
        verbose_name = "Faixa de Premiação"
        verbose_name_plural = "Faixas de Premiação"
        ordering = ["draw", "tier"]
        unique_together = ["draw", "tier"]

    def __str__(self):
        return f"{self.draw} - {self.description}"
