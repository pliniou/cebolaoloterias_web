"""
URL configuration for tickets app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = "tickets"

router = DefaultRouter()
router.register("", views.UserTicketViewSet, basename="ticket")


# Separate router for bet lines (standalone access)
lines_router = DefaultRouter()
lines_router.register("", views.UserBetLineViewSet, basename="betline")

urlpatterns = [
    path("", include(router.urls)),
    path("lines/", include(lines_router.urls)),
]
