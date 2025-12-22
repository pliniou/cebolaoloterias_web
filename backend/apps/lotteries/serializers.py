"""
DRF Serializers for lotteries app.

Serializers for Lottery, Draw, and PrizeTier models.
"""

from rest_framework import serializers

from .models import Draw, Lottery, PrizeTier


class LotterySerializer(serializers.ModelSerializer):
    """Serializer for Lottery model."""

    draws_count = serializers.SerializerMethodField()

    class Meta:
        model = Lottery
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "numbers_count",
            "min_number",
            "max_number",
            "color",
            "is_active",
            "draws_count",
        ]
        read_only_fields = fields

    def get_draws_count(self, obj) -> int:
        """Get total number of draws for this lottery."""
        return obj.draws.count()


class LotteryMinimalSerializer(serializers.ModelSerializer):
    """Minimal serializer for Lottery (used in nested responses)."""

    class Meta:
        model = Lottery
        fields = ["id", "name", "slug", "color"]
        read_only_fields = fields


class PrizeTierSerializer(serializers.ModelSerializer):
    """Serializer for PrizeTier model."""

    class Meta:
        model = PrizeTier
        fields = [
            "tier",
            "description",
            "matches",
            "winners_count",
            "prize_value",
        ]
        read_only_fields = fields


class DrawSerializer(serializers.ModelSerializer):
    """Serializer for Draw model with prize tiers."""

    lottery = LotteryMinimalSerializer(read_only=True)
    prize_tiers = PrizeTierSerializer(many=True, read_only=True)

    class Meta:
        model = Draw
        fields = [
            "id",
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
            "prize_tiers",
            "created_at",
        ]
        read_only_fields = fields


class DrawListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for Draw listings (without prize tiers)."""

    class Meta:
        model = Draw
        fields = [
            "id",
            "number",
            "draw_date",
            "numbers",
            "is_accumulated",
            "accumulated_value",
        ]
        read_only_fields = fields


class DrawSyncSerializer(serializers.Serializer):
    """Serializer for sync request/response."""

    number = serializers.IntegerField(
        required=False,
        help_text="Optional: specific draw number to sync",
    )


class SyncResponseSerializer(serializers.Serializer):
    """Serializer for sync response."""

    status = serializers.CharField()
    message = serializers.CharField()
    draw_number = serializers.IntegerField(required=False)
    draw_id = serializers.IntegerField(required=False)
