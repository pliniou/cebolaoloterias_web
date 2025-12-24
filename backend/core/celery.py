"""
Celery configuration for Cebola Loterias project.
"""

import os

from celery import Celery
import logging

# Set default Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings.dev")

app = Celery("cebolaoloterias")

# Using namespace='CELERY' means all celery-related config keys
# should have a `CELERY_` prefix in Django settings.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks from all installed apps
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task for testing Celery setup."""
    logger = logging.getLogger(__name__)
    logger.debug("Celery debug task request: %r", self.request)
