"""
Django Admin configuration for lotteries app.
"""

from django.contrib import admin

from .models import Draw, Lottery, PrizeTier


class PrizeTierInline(admin.TabularInline):
    """Inline admin for prize tiers."""

    model = PrizeTier
    extra = 0
    readonly_fields = ["tier", "description", "matches", "winners_count", "prize_value"]
    can_delete = False


@admin.register(Lottery)
class LotteryAdmin(admin.ModelAdmin):
    """Admin configuration for Lottery model."""

    list_display = ["name", "slug", "numbers_count", "max_number", "is_active"]
    list_filter = ["is_active"]
    search_fields = ["name", "slug"]
    prepopulated_fields = {"slug": ("name",)}
    readonly_fields = ["created_at", "updated_at"]
    
    fieldsets = [
        (None, {
            "fields": ["name", "slug", "api_identifier", "description"],
        }),
        ("Configuração", {
            "fields": ["numbers_count", "min_number", "max_number", "color"],
        }),
        ("Status", {
            "fields": ["is_active", "created_at", "updated_at"],
        }),
    ]


@admin.register(Draw)
class DrawAdmin(admin.ModelAdmin):
    """Admin configuration for Draw model."""

    list_display = [
        "lottery",
        "number",
        "draw_date",
        "display_numbers",
        "is_accumulated",
        "accumulated_value",
    ]
    list_filter = ["lottery", "is_accumulated", "draw_date"]
    search_fields = ["number"]
    readonly_fields = [
        "lottery",
        "number",
        "draw_date",
        "numbers",
        "numbers_draw_order",
        "is_accumulated",
        "accumulated_value",
        "next_draw_estimate",
        "total_revenue",
        "location",
        "city_state",
        "next_draw_number",
        "next_draw_date",
        "raw_data",
        "created_at",
        "updated_at",
    ]
    inlines = [PrizeTierInline]
    date_hierarchy = "draw_date"
    
    def display_numbers(self, obj):
        """Display numbers as formatted string."""
        return " - ".join(str(n).zfill(2) for n in obj.numbers)
    display_numbers.short_description = "Números"

    def has_add_permission(self, request):
        """Disable manual creation - draws should be synced from API."""
        return False


@admin.register(PrizeTier)
class PrizeTierAdmin(admin.ModelAdmin):
    """Admin configuration for PrizeTier model."""

    list_display = ["draw", "tier", "description", "winners_count", "prize_value"]
    list_filter = ["draw__lottery", "tier"]
    search_fields = ["draw__number"]
    readonly_fields = ["draw", "tier", "description", "matches", "winners_count", "prize_value"]

    def has_add_permission(self, request):
        """Disable manual creation."""
        return False
