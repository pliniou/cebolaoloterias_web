"""
Stats manager service.

Manages aggregation and caching of lottery statistics.
"""

import json
from collections import Counter
from datetime import date
from decimal import Decimal

from django.core.cache import cache

from apps.lotteries.models import Draw, Lottery
from apps.stats.models import DrawStatistics


class StatsManager:
    """Manages retrieval and caching of stats."""

    CACHE_TTL = 60 * 60  # 1 hour

    def get_aggregated_stats(
        self,
        lottery_slug: str,
        window: int | None = None,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> dict:
        """
        Get aggregated statistics for a lottery.
        
        Args:
            lottery_slug: Lottery identifier
            window: Number of last draws to consider
            start_date: Filter start date
            end_date: Filter end date
            
        Returns:
            Dict containing frequency maps and metric averages
        """
        # Generate cache key
        cache_key = self._generate_cache_key(lottery_slug, window, start_date, end_date)
        
        # Try to get from cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data

        # Fetch data
        queryset = self._filter_draws(lottery_slug, window, start_date, end_date)
        if not queryset.exists():
            return {}

        # Calculate aggregations
        stats = self._calculate_aggregations(queryset)
        
        # Cache result
        cache.set(cache_key, stats, self.CACHE_TTL)
        
        return stats

    def invalidate_cache(self, lottery_slug: str):
        """Invalidate all stats caches for a lottery."""
        # Note: Redis scanning/pattern matching is expensive.
        # For simplicity, we mostly rely on TTL or explicit keys if known.
        # Alternatively, we could version the keys.
        cache.delete_pattern(f"stats:{lottery_slug}:*")

    def _generate_cache_key(self, slug: str, window: int | None, start: date | None, end: date | None) -> str:
        """Generate unique cache key."""
        key_parts = [f"stats:{slug}"]
        if window:
            key_parts.append(f"w{window}")
        if start:
            key_parts.append(f"s{start.isoformat()}")
        if end:
            key_parts.append(f"e{end.isoformat()}")
        return ":".join(key_parts)

    def _filter_draws(self, slug: str, window: int | None, start: date | None, end: date | None):
        """Filter draws based on criteria."""
        qs = Draw.objects.filter(lottery__slug=slug, lottery__is_active=True).select_related("stats")
        
        if start:
            qs = qs.filter(draw_date__gte=start)
        if end:
            qs = qs.filter(draw_date__lte=end)
            
        qs = qs.order_by("-number")
        
        if window:
            qs = qs[:window]
            
        return qs

    def _calculate_aggregations(self, queryset) -> dict:
        """Calculate aggregated metrics from queryset."""
        # Ensure we have the list in memory
        draws = list(queryset)
        total_draws = len(draws)
        
        if total_draws == 0:
            return {}

        # Frequency counters
        number_frequency = Counter()
        
        # Metric accumulators
        total_sum = 0
        total_range = 0
        total_evens = 0
        total_odds = 0
        total_primes = 0
        total_consecutive = 0
        total_repeated = 0

        # Processing loop
        for draw in draws:
            # Numbers frequency
            number_frequency.update(draw.numbers)
            
            # Metrics
            if hasattr(draw, "stats"):
                stats = draw.stats
                total_sum += stats.sum_value
                total_range += stats.range_value
                total_evens += stats.even_count
                total_odds += stats.odd_count
                total_primes += stats.prime_count
                total_consecutive += stats.consecutive_count
                total_repeated += stats.repeated_from_previous

        # Calculate frequency list
        most_frequent = [
            {"number": num, "count": count, "frequency": round(count / total_draws, 4)}
            for num, count in number_frequency.most_common()
        ]

        return {
            "total_analyzed": total_draws,
            "number_frequencies": most_frequent,
            "averages": {
                "sum": round(total_sum / total_draws, 2),
                "range": round(total_range / total_draws, 2),
                "evens": round(total_evens / total_draws, 2),
                "odds": round(total_odds / total_draws, 2),
                "primes": round(total_primes / total_draws, 2),
                "consecutive": round(total_consecutive / total_draws, 2),
                "repeated": round(total_repeated / total_draws, 2),
            }
        }
