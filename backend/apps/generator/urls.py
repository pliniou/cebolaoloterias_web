"""
URL configuration for generator app.
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

app_name = "generator"

router = DefaultRouter()
router.register("presets", views.PresetViewSet, basename="preset")
router.register("runs", views.GeneratorRunViewSet, basename="run")

urlpatterns = [
    path("", include(router.urls)),
]
