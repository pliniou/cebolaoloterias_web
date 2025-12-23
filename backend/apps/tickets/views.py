"""
DRF Views for tickets app.

API views for managing user tickets and checking results.
"""

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet

from .models import TicketCheckResult, UserBetLine, UserTicket
from .serializers import (
    CheckRequestSerializer,
    TicketCheckResultListSerializer,
    TicketCheckResultSerializer,
    UserBetLineCreateSerializer,
    UserBetLineSerializer,
    UserTicketCreateSerializer,
    UserTicketListSerializer,
    UserTicketSerializer,
)
from .services import TicketCheckService


@extend_schema_view(
    list=extend_schema(
        summary="Listar bilhetes",
        description="Retorna lista de bilhetes do usuário autenticado.",
        tags=["Bilhetes"],
    ),
    create=extend_schema(
        summary="Criar bilhete",
        description="Cria um novo bilhete com linhas de aposta opcionais.",
        tags=["Bilhetes"],
    ),
    retrieve=extend_schema(
        summary="Detalhes do bilhete",
        description="Retorna detalhes de um bilhete específico com suas linhas.",
        tags=["Bilhetes"],
    ),
    update=extend_schema(
        summary="Atualizar bilhete",
        description="Atualiza os dados de um bilhete (exceto linhas).",
        tags=["Bilhetes"],
    ),
    partial_update=extend_schema(
        summary="Atualizar bilhete parcialmente",
        description="Atualiza parcialmente os dados de um bilhete.",
        tags=["Bilhetes"],
    ),
    destroy=extend_schema(
        summary="Remover bilhete",
        description="Remove um bilhete e todas as suas linhas.",
        tags=["Bilhetes"],
    ),
)
class UserTicketViewSet(ModelViewSet):
    """
    ViewSet for managing user tickets.

    Provides CRUD operations for tickets and additional actions
    for managing bet lines and checking results.
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter tickets to only show user's own tickets."""
        return (
            UserTicket.objects.filter(user=self.request.user)
            .select_related("lottery")
            .prefetch_related("bet_lines")
        )

    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == "list":
            return UserTicketListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return UserTicketCreateSerializer
        return UserTicketSerializer

    @extend_schema(
        summary="Listar linhas do bilhete",
        description="Retorna todas as linhas de aposta de um bilhete.",
        tags=["Linhas de Aposta"],
        responses={200: UserBetLineSerializer(many=True)},
    )
    @action(detail=True, methods=["get"])
    def lines(self, request, pk=None):
        """List all bet lines for a ticket."""
        ticket = self.get_object()
        lines = ticket.bet_lines.all()
        serializer = UserBetLineSerializer(lines, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Adicionar linha ao bilhete",
        description="Adiciona uma nova linha de aposta ao bilhete.",
        tags=["Linhas de Aposta"],
        request=UserBetLineCreateSerializer,
        responses={201: UserBetLineSerializer},
    )
    @lines.mapping.post
    def add_line(self, request, pk=None):
        """Add a new bet line to the ticket."""
        ticket = self.get_object()

        serializer = UserBetLineCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Validate numbers count
        numbers = serializer.validated_data["numbers"]
        if len(numbers) != ticket.numbers_per_bet:
            return Response(
                {"error": f"Line must have exactly {ticket.numbers_per_bet} numbers."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate number range
        lottery = ticket.lottery
        for n in numbers:
            if n < lottery.min_number or n > lottery.max_number:
                return Response(
                    {
                        "error": f"Numbers must be between {lottery.min_number} and {lottery.max_number}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Set order if not provided
        order = serializer.validated_data.get("order")
        if order is None:
            max_order = ticket.bet_lines.aggregate(
                max_order=models.Max("order")
            )["max_order"]
            order = (max_order or -1) + 1

        line = UserBetLine.objects.create(
            ticket=ticket,
            numbers=numbers,
            order=order,
        )

        return Response(
            UserBetLineSerializer(line).data,
            status=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="Conferir bilhete",
        description="Confere o bilhete contra o último sorteio ou um sorteio específico.",
        tags=["Conferência"],
        request=CheckRequestSerializer,
        responses={200: TicketCheckResultSerializer},
    )
    @action(detail=True, methods=["post"])
    def check(self, request, pk=None):
        """Check ticket against a draw."""
        ticket = self.get_object()

        serializer = CheckRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        draw_number = serializer.validated_data.get("draw_number")

        service = TicketCheckService()

        try:
            if draw_number:
                result = service.check_ticket_by_draw_number(ticket, draw_number)
            else:
                result = service.check_ticket_latest(ticket)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TicketCheckResultSerializer(result).data)

    @extend_schema(
        summary="Histórico de conferências",
        description="Retorna o histórico de conferências do bilhete.",
        tags=["Conferência"],
        responses={200: TicketCheckResultListSerializer(many=True)},
    )
    @action(detail=True, methods=["get"])
    def results(self, request, pk=None):
        """Get check results history for a ticket."""
        ticket = self.get_object()
        results = ticket.check_results.select_related("draw").all()

        # Paginate results
        page = self.paginate_queryset(results)
        if page is not None:
            serializer = TicketCheckResultListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = TicketCheckResultListSerializer(results, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary="Detalhes de conferência",
        description="Retorna detalhes de uma conferência específica.",
        tags=["Conferência"],
        responses={200: TicketCheckResultSerializer},
    )
    @action(detail=True, methods=["get"], url_path=r"results/(?P<result_id>\d+)")
    def result_detail(self, request, pk=None, result_id=None):
        """Get a specific check result."""
        ticket = self.get_object()
        result = get_object_or_404(
            TicketCheckResult.objects.select_related("draw").prefetch_related(
                "line_results__bet_line", "line_results__prize_tier"
            ),
            id=result_id,
            ticket=ticket,
        )
        return Response(TicketCheckResultSerializer(result).data)


@extend_schema_view(
    list=extend_schema(
        summary="Listar linhas de aposta",
        description="Retorna todas as linhas de aposta do usuário.",
        tags=["Linhas de Aposta"],
    ),
    retrieve=extend_schema(
        summary="Detalhes da linha",
        description="Retorna detalhes de uma linha específica.",
        tags=["Linhas de Aposta"],
    ),
    destroy=extend_schema(
        summary="Remover linha",
        description="Remove uma linha de aposta.",
        tags=["Linhas de Aposta"],
    ),
)
class UserBetLineViewSet(ModelViewSet):
    """
    ViewSet for managing bet lines.

    Provides operations for viewing and deleting individual bet lines.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = UserBetLineSerializer
    http_method_names = ["get", "delete", "head", "options"]

    def get_queryset(self):
        """Filter lines to only show user's own lines."""
        return UserBetLine.objects.filter(
            ticket__user=self.request.user
        ).select_related("ticket__lottery")


# Need to import models for the aggregate
from django.db import models  # noqa: E402
