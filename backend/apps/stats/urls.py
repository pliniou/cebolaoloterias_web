"""
URL configuration for stats app.
"""

from django.urls import path

from . import views

app_name = "stats"

urlpatterns = [
    path("<slug:slug>/", views.AggregatedStatsView.as_view(), name="aggregated-stats"),
]
