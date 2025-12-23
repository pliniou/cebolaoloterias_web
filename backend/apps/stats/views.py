"""
DRF View for stats endpoints.
"""

from datetime import datetime

from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.stats.services.manager import StatsManager


class AggregatedStatsView(APIView):
    """
    Get aggregated statistics for a lottery.
    """

    @extend_schema(
        summary="Estatísticas Agregadas",
        description="Retorna estatísticas agregadas (frequências, médias) para uma janela de sorteios.",
        tags=["Estatísticas"],
        parameters=[
            OpenApiParameter("window", int, description="Janela de sorteios (ex: 10, 50, 100)"),
            OpenApiParameter("start_date", str, description="Data inicial (YYYY-MM-DD)"),
            OpenApiParameter("end_date", str, description="Data final (YYYY-MM-DD)"),
        ],
    )
    def get(self, request, slug):
        manager = StatsManager()

        # Parse params
        window = request.query_params.get("window")
        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        try:
            if window:
                window = int(window)
            if start_date:
                start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            if end_date:
                end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid parameters format."},
                status=status.HTTP_400_BAD_REQUEST
            )

        stats = manager.get_aggregated_stats(slug, window, start_date, end_date)
        return Response(stats)
