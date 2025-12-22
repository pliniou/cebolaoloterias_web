"""
Models for tickets app.

Defines UserTicket, UserBetLine, TicketCheckResult, and LineCheckResult models.
"""

from django.conf import settings
from django.db import models

from apps.lotteries.models import Draw, Lottery, PrizeTier


class UserTicket(models.Model):
    """
    Represents a user's ticket containing multiple bet lines.
    
    A ticket is a collection of bet lines for a specific lottery.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tickets",
        verbose_name="Usuário",
    )
    lottery = models.ForeignKey(
        Lottery,
        on_delete=models.CASCADE,
        related_name="user_tickets",
        verbose_name="Loteria",
    )
    name = models.CharField(
        max_length=100,
        blank=True,
        verbose_name="Nome",
        help_text="Nome opcional para identificar o bilhete",
    )
    numbers_per_bet = models.PositiveSmallIntegerField(
        verbose_name="Números por aposta",
        help_text="Quantidade de números em cada linha (ex: 6, 7, 8 para Mega-Sena)",
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Ativo",
        help_text="Se o bilhete está ativo para conferências",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bilhete"
        verbose_name_plural = "Bilhetes"
        ordering = ["-created_at"]

    def __str__(self):
        name = self.name or f"Bilhete {self.id}"
        return f"{name} - {self.lottery.name}"

    @property
    def lines_count(self) -> int:
        """Get the number of bet lines in this ticket."""
        return self.bet_lines.count()


class UserBetLine(models.Model):
    """
    Represents a single bet line within a ticket.
    
    Each line contains a set of numbers the user has bet on.
    """

    ticket = models.ForeignKey(
        UserTicket,
        on_delete=models.CASCADE,
        related_name="bet_lines",
        verbose_name="Bilhete",
    )
    numbers = models.JSONField(
        verbose_name="Números",
        help_text="Lista de números apostados (ex: [1, 5, 23, 34, 45, 60])",
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name="Ordem",
        help_text="Ordem da linha no bilhete",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Linha de Aposta"
        verbose_name_plural = "Linhas de Aposta"
        ordering = ["ticket", "order"]

    def __str__(self):
        numbers_str = " - ".join(str(n).zfill(2) for n in sorted(self.numbers))
        return f"Linha {self.order + 1}: {numbers_str}"

    def clean(self):
        """Validate the bet line numbers."""
        from django.core.exceptions import ValidationError

        if not self.numbers:
            raise ValidationError("A linha deve conter números.")

        lottery = self.ticket.lottery
        expected_count = self.ticket.numbers_per_bet

        if len(self.numbers) != expected_count:
            raise ValidationError(
                f"A linha deve conter exatamente {expected_count} números."
            )

        for number in self.numbers:
            if not isinstance(number, int):
                raise ValidationError("Todos os números devem ser inteiros.")
            if number < lottery.min_number or number > lottery.max_number:
                raise ValidationError(
                    f"Números devem estar entre {lottery.min_number} e {lottery.max_number}."
                )

        if len(set(self.numbers)) != len(self.numbers):
            raise ValidationError("Não pode haver números repetidos.")


class TicketCheckResult(models.Model):
    """
    Result of checking a ticket against a specific draw.
    
    Stores the overall result of the check including total prize won.
    """

    ticket = models.ForeignKey(
        UserTicket,
        on_delete=models.CASCADE,
        related_name="check_results",
        verbose_name="Bilhete",
    )
    draw = models.ForeignKey(
        Draw,
        on_delete=models.CASCADE,
        related_name="ticket_checks",
        verbose_name="Sorteio",
    )
    checked_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Data da conferência",
    )
    total_prize = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Prêmio total",
        help_text="Soma de todos os prêmios das linhas",
    )
    best_tier = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        verbose_name="Melhor faixa",
        help_text="Melhor faixa de premiação atingida (1 = maior prêmio)",
    )
    best_hits = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Maior acertos",
        help_text="Maior quantidade de acertos em uma linha",
    )
    winning_lines_count = models.PositiveIntegerField(
        default=0,
        verbose_name="Linhas premiadas",
        help_text="Quantidade de linhas que ganharam algum prêmio",
    )

    class Meta:
        verbose_name = "Resultado de Conferência"
        verbose_name_plural = "Resultados de Conferências"
        ordering = ["-checked_at"]
        unique_together = ["ticket", "draw"]

    def __str__(self):
        return f"{self.ticket} vs Concurso {self.draw.number}"


class LineCheckResult(models.Model):
    """
    Result of checking a single bet line against a draw.
    
    Stores the hits and prize for each individual line.
    """

    check_result = models.ForeignKey(
        TicketCheckResult,
        on_delete=models.CASCADE,
        related_name="line_results",
        verbose_name="Resultado da conferência",
    )
    bet_line = models.ForeignKey(
        UserBetLine,
        on_delete=models.CASCADE,
        related_name="check_results",
        verbose_name="Linha de aposta",
    )
    hits = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Acertos",
        help_text="Quantidade de números acertados",
    )
    hit_numbers = models.JSONField(
        default=list,
        verbose_name="Números acertados",
        help_text="Lista dos números que foram acertados",
    )
    prize_tier = models.ForeignKey(
        PrizeTier,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="line_wins",
        verbose_name="Faixa de prêmio",
    )
    prize_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        verbose_name="Valor do prêmio",
    )

    class Meta:
        verbose_name = "Resultado de Linha"
        verbose_name_plural = "Resultados de Linhas"
        ordering = ["check_result", "bet_line__order"]

    def __str__(self):
        return f"{self.bet_line} - {self.hits} acertos"
