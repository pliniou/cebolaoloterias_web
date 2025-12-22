"""
DRF Serializers for tickets app.

Serializers for UserTicket, UserBetLine, and check results.
"""

from rest_framework import serializers

from apps.lotteries.serializers import DrawListSerializer, LotteryMinimalSerializer

from .models import LineCheckResult, TicketCheckResult, UserBetLine, UserTicket


class UserBetLineSerializer(serializers.ModelSerializer):
    """Serializer for UserBetLine model."""

    class Meta:
        model = UserBetLine
        fields = ["id", "numbers", "order", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserBetLineCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bet lines."""

    class Meta:
        model = UserBetLine
        fields = ["numbers", "order"]

    def validate_numbers(self, value):
        """Validate numbers list."""
        if not isinstance(value, list):
            raise serializers.ValidationError("Numbers must be a list.")
        if not all(isinstance(n, int) for n in value):
            raise serializers.ValidationError("All numbers must be integers.")
        if len(set(value)) != len(value):
            raise serializers.ValidationError("Numbers cannot repeat.")
        return sorted(value)


class UserTicketSerializer(serializers.ModelSerializer):
    """Serializer for UserTicket model (read)."""

    lottery = LotteryMinimalSerializer(read_only=True)
    bet_lines = UserBetLineSerializer(many=True, read_only=True)
    lines_count = serializers.IntegerField(read_only=True)
    last_check = serializers.SerializerMethodField()

    class Meta:
        model = UserTicket
        fields = [
            "id",
            "lottery",
            "name",
            "numbers_per_bet",
            "is_active",
            "lines_count",
            "bet_lines",
            "last_check",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_last_check(self, obj) -> dict | None:
        """Get the last check result summary."""
        last = obj.check_results.first()
        if not last:
            return None
        return {
            "draw_number": last.draw.number,
            "draw_date": last.draw.draw_date,
            "best_hits": last.best_hits,
            "total_prize": str(last.total_prize),
            "checked_at": last.checked_at,
        }


class UserTicketCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating UserTicket."""

    bet_lines = UserBetLineCreateSerializer(many=True, required=False)

    class Meta:
        model = UserTicket
        fields = ["lottery", "name", "numbers_per_bet", "is_active", "bet_lines"]

    def validate(self, data):
        """Validate ticket data."""
        lottery = data.get("lottery") or (self.instance.lottery if self.instance else None)
        numbers_per_bet = data.get("numbers_per_bet") or (
            self.instance.numbers_per_bet if self.instance else None
        )

        if lottery and numbers_per_bet:
            if numbers_per_bet < lottery.numbers_count:
                raise serializers.ValidationError(
                    f"numbers_per_bet must be at least {lottery.numbers_count} for {lottery.name}."
                )

        # Validate bet lines
        bet_lines = data.get("bet_lines", [])
        for line_data in bet_lines:
            numbers = line_data.get("numbers", [])
            if len(numbers) != numbers_per_bet:
                raise serializers.ValidationError(
                    f"Each line must have exactly {numbers_per_bet} numbers."
                )
            if lottery:
                for n in numbers:
                    if n < lottery.min_number or n > lottery.max_number:
                        raise serializers.ValidationError(
                            f"Numbers must be between {lottery.min_number} and {lottery.max_number}."
                        )

        return data

    def create(self, validated_data):
        """Create ticket with bet lines."""
        bet_lines_data = validated_data.pop("bet_lines", [])
        validated_data["user"] = self.context["request"].user

        ticket = UserTicket.objects.create(**validated_data)

        for i, line_data in enumerate(bet_lines_data):
            line_data.setdefault("order", i)
            UserBetLine.objects.create(ticket=ticket, **line_data)

        return ticket

    def update(self, instance, validated_data):
        """Update ticket (without bet lines - use separate endpoint)."""
        validated_data.pop("bet_lines", None)  # Ignore bet_lines on update

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class UserTicketListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for ticket listings."""

    lottery_name = serializers.CharField(source="lottery.name", read_only=True)
    lottery_color = serializers.CharField(source="lottery.color", read_only=True)
    lines_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = UserTicket
        fields = [
            "id",
            "name",
            "lottery_name",
            "lottery_color",
            "numbers_per_bet",
            "lines_count",
            "is_active",
            "created_at",
        ]
        read_only_fields = fields


# Check Result Serializers


class LineCheckResultSerializer(serializers.ModelSerializer):
    """Serializer for line check results."""

    bet_numbers = serializers.JSONField(source="bet_line.numbers", read_only=True)
    prize_tier_description = serializers.CharField(
        source="prize_tier.description", read_only=True, allow_null=True
    )

    class Meta:
        model = LineCheckResult
        fields = [
            "id",
            "bet_numbers",
            "hits",
            "hit_numbers",
            "prize_tier_description",
            "prize_value",
        ]
        read_only_fields = fields


class TicketCheckResultSerializer(serializers.ModelSerializer):
    """Serializer for ticket check results."""

    draw = DrawListSerializer(read_only=True)
    line_results = LineCheckResultSerializer(many=True, read_only=True)

    class Meta:
        model = TicketCheckResult
        fields = [
            "id",
            "draw",
            "checked_at",
            "total_prize",
            "best_tier",
            "best_hits",
            "winning_lines_count",
            "line_results",
        ]
        read_only_fields = fields


class TicketCheckResultListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for check result listings."""

    draw_number = serializers.IntegerField(source="draw.number", read_only=True)
    draw_date = serializers.DateField(source="draw.draw_date", read_only=True)

    class Meta:
        model = TicketCheckResult
        fields = [
            "id",
            "draw_number",
            "draw_date",
            "checked_at",
            "best_hits",
            "total_prize",
            "winning_lines_count",
        ]
        read_only_fields = fields


class CheckRequestSerializer(serializers.Serializer):
    """Serializer for check request."""

    draw_number = serializers.IntegerField(
        required=False,
        help_text="Optional: specific draw number to check against. If not provided, checks against latest.",
    )
