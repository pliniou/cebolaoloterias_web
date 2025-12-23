"""
DRF Views for generator app.
"""

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from apps.generator.engine.core import BaseGenerator
from apps.generator.models import GeneratorRun, Preset
from apps.generator.serializers import (
    GenerateRequestSerializer,
    GeneratorRunSerializer,
    PresetSerializer,
)
from apps.lotteries.models import Lottery


@extend_schema_view(
    list=extend_schema(summary="Listar presets", tags=["Gerador"]),
    create=extend_schema(summary="Criar preset", tags=["Gerador"]),
    retrieve=extend_schema(summary="Detalhes do preset", tags=["Gerador"]),
    update=extend_schema(summary="Atualizar preset", tags=["Gerador"]),
    destroy=extend_schema(summary="Remover preset", tags=["Gerador"]),
)
class PresetViewSet(ModelViewSet):
    """
    ViewSet for managing generation presets.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = PresetSerializer

    def get_queryset(self):
        return Preset.objects.filter(user=self.request.user)

    @extend_schema(
        summary="Gerar jogos com Preset",
        description="Gera jogos utilizando as configurações deste Preset.",
        request=GenerateRequestSerializer,
        responses={200: GeneratorRunSerializer},
        tags=["Gerador"],
    )
    @action(detail=True, methods=["post"])
    def run(self, request, pk=None):
        """Generate games using this preset."""
        preset = self.get_object()

        serializer = GenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        count = serializer.validated_data["count"]
        # Allow overriding config
        override_config = serializer.validated_data.get("config", {})

        final_config = preset.config.copy()
        final_config.update(override_config)

        # Run generator
        try:
            generator = BaseGenerator(preset.lottery, final_config)
            games = generator.generate(count)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Save run
        run = GeneratorRun.objects.create(
            user=request.user,
            preset=preset,
            lottery=preset.lottery,
            count=count,
            result=games
        )

        return Response(GeneratorRunSerializer(run).data)


@extend_schema_view(
    list=extend_schema(summary="Histórico de gerações", tags=["Gerador"]),
    retrieve=extend_schema(summary="Detalhes da execução", tags=["Gerador"]),
)
class GeneratorRunViewSet(ModelViewSet):
    """
    ViewSet for viewing generation history.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = GeneratorRunSerializer
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        return GeneratorRun.objects.filter(user=self.request.user)

    @extend_schema(
        summary="Gerar jogos (Ad-hoc)",
        description="Gera jogos sem precisar salvar um preset antes.",
        request=GenerateRequestSerializer,
        responses={200: GeneratorRunSerializer},
        tags=["Gerador"],
    )
    def create(self, request, *args, **kwargs):
        """Metadata for creating ad-hoc runs."""
        serializer = GenerateRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        lottery_id = serializer.validated_data.get("lottery_id")
        if not lottery_id:
            return Response(
                {"error": "lottery_id is required for ad-hoc generation."},
                status=status.HTTP_400_BAD_REQUEST
            )

        lottery = get_object_or_404(Lottery, id=lottery_id)
        config = serializer.validated_data.get("config", {})
        count = serializer.validated_data["count"]

        # Run generator
        try:
            generator = BaseGenerator(lottery, config)
            games = generator.generate(count)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        # Save run
        run = GeneratorRun.objects.create(
            user=request.user,
            preset=None,
            lottery=lottery,
            count=count,
            result=games
        )

        return Response(GeneratorRunSerializer(run).data, status=status.HTTP_201_CREATED)
