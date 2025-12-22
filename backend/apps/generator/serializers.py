"""
DRF Serializers for generator app.
"""

from rest_framework import serializers

from apps.lotteries.serializers import LotteryMinimalSerializer
from apps.generator.models import GeneratorRun, Preset


class PresetSerializer(serializers.ModelSerializer):
    """Serializer for Preset model."""

    lottery_details = LotteryMinimalSerializer(source="lottery", read_only=True)

    class Meta:
        model = Preset
        fields = [
            "id",
            "lottery",
            "lottery_details",
            "name",
            "description",
            "config",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def create(self, validated_data):
        """Associate with current user on create."""
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class GeneratorRunSerializer(serializers.ModelSerializer):
    """Serializer for GeneratorRun model."""
    
    lottery_name = serializers.CharField(source="lottery.name", read_only=True)
    preset_name = serializers.CharField(source="preset.name", read_only=True, allow_null=True)

    class Meta:
        model = GeneratorRun
        fields = [
            "id",
            "lottery",
            "lottery_name",
            "preset",
            "preset_name",
            "count",
            "result",
            "created_at",
        ]
        read_only_fields = fields


class GenerateRequestSerializer(serializers.Serializer):
    """Request schema for generating games."""
    
    count = serializers.IntegerField(min_value=1, max_value=50, default=1)
    config = serializers.JSONField(
        required=False,
        help_text="Override preset config or provide new config for ad-hoc run."
    )
    lottery_id = serializers.IntegerField(
        required=False,
        help_text="Required if not using a preset."
    )
