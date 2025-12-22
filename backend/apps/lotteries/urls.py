"""
URL configuration for lotteries app.
"""

from django.urls import path

from . import views

app_name = "lotteries"

urlpatterns = [
    # Lottery endpoints
    path("", views.LotteryListView.as_view(), name="lottery-list"),
    path("<slug:slug>/", views.LotteryDetailView.as_view(), name="lottery-detail"),
    
    # Draw endpoints
    path("<slug:slug>/latest/", views.LatestDrawView.as_view(), name="latest-draw"),
    path("<slug:slug>/draws/", views.DrawListView.as_view(), name="draw-list"),
    path("<slug:slug>/draws/<int:number>/", views.DrawDetailView.as_view(), name="draw-detail"),
    
    # Admin endpoints
    path("<slug:slug>/sync/", views.SyncDrawView.as_view(), name="sync-draw"),
]
