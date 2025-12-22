"""
DRF Views for lotteries app.

API views for listing lotteries, draws, and syncing results.
"""

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Draw, Lottery
from .serializers import (
    DrawListSerializer,
    DrawSerializer,
    DrawSyncSerializer,
    LotterySerializer,
    SyncResponseSerializer,
)
from .tasks import sync_draw_by_number, sync_lottery_results


@extend_schema_view(
    get=extend_schema(
        summary="Listar loterias",
        description="Retorna lista de todas as loterias ativas.",
        tags=["Loterias"],
    )
)
class LotteryListView(ListAPIView):
    """List all active lotteries."""

    queryset = Lottery.objects.filter(is_active=True)
    serializer_class = LotterySerializer
    permission_classes = [AllowAny]
    pagination_class = None


@extend_schema_view(
    get=extend_schema(
        summary="Detalhes da loteria",
        description="Retorna detalhes de uma loteria específica.",
        tags=["Loterias"],
    )
)
class LotteryDetailView(RetrieveAPIView):
    """Retrieve a single lottery by slug."""

    queryset = Lottery.objects.filter(is_active=True)
    serializer_class = LotterySerializer
    permission_classes = [AllowAny]
    lookup_field = "slug"


@extend_schema_view(
    get=extend_schema(
        summary="Último sorteio",
        description="Retorna o último sorteio de uma loteria com faixas de premiação.",
        tags=["Sorteios"],
    )
)
class LatestDrawView(APIView):
    """Get the latest draw for a lottery."""

    permission_classes = [AllowAny]

    def get(self, request, slug):
        lottery = get_object_or_404(Lottery, slug=slug, is_active=True)
        draw = lottery.draws.select_related("lottery").prefetch_related("prize_tiers").first()
        
        if not draw:
            return Response(
                {"detail": "Nenhum sorteio encontrado para esta loteria."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        serializer = DrawSerializer(draw)
        return Response(serializer.data)


@extend_schema_view(
    get=extend_schema(
        summary="Histórico de sorteios",
        description="Retorna histórico paginado de sorteios de uma loteria.",
        tags=["Sorteios"],
        parameters=[
            OpenApiParameter(
                name="page",
                type=int,
                description="Número da página",
            ),
        ],
    )
)
class DrawListView(ListAPIView):
    """List all draws for a lottery with pagination."""

    serializer_class = DrawListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        slug = self.kwargs.get("slug")
        return Draw.objects.filter(
            lottery__slug=slug,
            lottery__is_active=True,
        ).order_by("-number")


@extend_schema_view(
    get=extend_schema(
        summary="Sorteio por número",
        description="Retorna um sorteio específico pelo número do concurso.",
        tags=["Sorteios"],
    )
)
class DrawDetailView(APIView):
    """Get a specific draw by number."""

    permission_classes = [AllowAny]

    def get(self, request, slug, number):
        lottery = get_object_or_404(Lottery, slug=slug, is_active=True)
        draw = get_object_or_404(
            Draw.objects.select_related("lottery").prefetch_related("prize_tiers"),
            lottery=lottery,
            number=number,
        )
        serializer = DrawSerializer(draw)
        return Response(serializer.data)


@extend_schema(
    summary="Sincronizar sorteios",
    description="Dispara sincronização de sorteios da CAIXA. Requer autenticação de admin.",
    tags=["Admin"],
    request=DrawSyncSerializer,
    responses={200: SyncResponseSerializer},
)
class SyncDrawView(APIView):
    """Trigger sync of lottery results (admin only)."""

    permission_classes = [IsAdminUser]

    def post(self, request, slug):
        lottery = get_object_or_404(Lottery, slug=slug, is_active=True)
        serializer = DrawSyncSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        number = serializer.validated_data.get("number")
        
        if number:
            # Sync specific draw
            result = sync_draw_by_number.delay(lottery.slug, number)
        else:
            # Sync latest draw
            result = sync_lottery_results.delay(lottery.slug)
        
        return Response({
            "status": "queued",
            "message": f"Sync task queued for {lottery.name}",
            "task_id": result.id,
        })
