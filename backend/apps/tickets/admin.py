"""
Django Admin configuration for tickets app.
"""

from django.contrib import admin

from .models import LineCheckResult, TicketCheckResult, UserBetLine, UserTicket


class UserBetLineInline(admin.TabularInline):
    """Inline admin for bet lines."""

    model = UserBetLine
    extra = 0
    fields = ["order", "numbers", "created_at"]
    readonly_fields = ["created_at"]


class LineCheckResultInline(admin.TabularInline):
    """Inline admin for line check results."""

    model = LineCheckResult
    extra = 0
    readonly_fields = ["bet_line", "hits", "hit_numbers", "prize_tier", "prize_value"]
    can_delete = False


@admin.register(UserTicket)
class UserTicketAdmin(admin.ModelAdmin):
    """Admin configuration for UserTicket model."""

    list_display = [
        "id",
        "user",
        "lottery",
        "name",
        "numbers_per_bet",
        "lines_count",
        "is_active",
        "created_at",
    ]
    list_filter = ["lottery", "is_active", "created_at"]
    search_fields = ["user__username", "user__email", "name"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [UserBetLineInline]

    fieldsets = [
        (None, {
            "fields": ["user", "lottery", "name"],
        }),
        ("Configuração", {
            "fields": ["numbers_per_bet", "is_active"],
        }),
        ("Datas", {
            "fields": ["created_at", "updated_at"],
        }),
    ]

    def lines_count(self, obj):
        """Display number of bet lines."""
        return obj.bet_lines.count()
    lines_count.short_description = "Linhas"


@admin.register(UserBetLine)
class UserBetLineAdmin(admin.ModelAdmin):
    """Admin configuration for UserBetLine model."""

    list_display = ["id", "ticket", "display_numbers", "order", "created_at"]
    list_filter = ["ticket__lottery", "created_at"]
    search_fields = ["ticket__user__username", "ticket__name"]
    readonly_fields = ["created_at"]

    def display_numbers(self, obj):
        """Display numbers as formatted string."""
        return " - ".join(str(n).zfill(2) for n in sorted(obj.numbers))
    display_numbers.short_description = "Números"


@admin.register(TicketCheckResult)
class TicketCheckResultAdmin(admin.ModelAdmin):
    """Admin configuration for TicketCheckResult model."""

    list_display = [
        "id",
        "ticket",
        "draw",
        "best_hits",
        "winning_lines_count",
        "total_prize",
        "checked_at",
    ]
    list_filter = ["ticket__lottery", "checked_at", "best_hits"]
    search_fields = ["ticket__user__username", "ticket__name"]
    readonly_fields = [
        "ticket",
        "draw",
        "checked_at",
        "total_prize",
        "best_tier",
        "best_hits",
        "winning_lines_count",
    ]
    inlines = [LineCheckResultInline]
    date_hierarchy = "checked_at"

    def has_add_permission(self, request):
        """Disable manual creation - results are created by the check service."""
        return False


@admin.register(LineCheckResult)
class LineCheckResultAdmin(admin.ModelAdmin):
    """Admin configuration for LineCheckResult model."""

    list_display = [
        "id",
        "check_result",
        "bet_line",
        "hits",
        "prize_tier",
        "prize_value",
    ]
    list_filter = ["check_result__ticket__lottery", "hits"]
    readonly_fields = [
        "check_result",
        "bet_line",
        "hits",
        "hit_numbers",
        "prize_tier",
        "prize_value",
    ]

    def has_add_permission(self, request):
        """Disable manual creation."""
        return False
