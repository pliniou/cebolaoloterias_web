"""
Core generator logic.
"""

import random

from apps.lotteries.models import Lottery
from apps.stats.services.calculator import StatsCalculator

from .validators import (
    BaseValidator,
    EvenOddValidator,
    ExclusionValidator,
    FixNumbersValidator,
    PrimeValidator,
    SumValidator,
)


class BaseGenerator:
    """
    Engine for generating lottery games based on configuration.
    """

    MAX_ATTEMPTS = 10000  # Safety break

    def __init__(self, lottery: Lottery, config: dict):
        self.lottery = lottery
        self.config = config
        self.validators = self._build_validators(config)
        self.pool = self._build_pool(lottery, config)
        self.fixed_numbers = set(config.get("fixed_numbers", []))
        self.numbers_count = config.get("numbers_count", lottery.numbers_count)

    def generate(self, count: int) -> list[dict]:
        """
        Generate N games satisfying all validators.
        
        Args:
            count: Number of games to generate
            
        Returns:
            List of generated games (dicts with numbers and metadata)
        """
        games = []
        attempts = 0
        
        while len(games) < count and attempts < self.MAX_ATTEMPTS:
            attempts += 1
            
            # 1. Generate candidate
            numbers = self._generate_candidate()
            
            # 2. Validate
            if self._validate_candidate(numbers):
                score = self._calculate_score(numbers)
                games.append({
                    "numbers": sorted(numbers),
                    "score": score,
                    "met_rules": [v.get_description() for v in self.validators]
                })

        return games

    def _build_validators(self, config: dict) -> list[BaseValidator]:
        """Factory method to create validators from config."""
        validators = []
        
        if "min_sum" in config or "max_sum" in config:
            validators.append(SumValidator(
                min_sum=config.get("min_sum"),
                max_sum=config.get("max_sum")
            ))
            
        if "min_even" in config or "max_even" in config:
            validators.append(EvenOddValidator(
                min_even=config.get("min_even"),
                max_even=config.get("max_even")
            ))
            
        if "min_primes" in config or "max_primes" in config:
            validators.append(PrimeValidator(
                min_primes=config.get("min_primes"),
                max_primes=config.get("max_primes")
            ))
            
        if "exclude_numbers" in config and config["exclude_numbers"]:
            validators.append(ExclusionValidator(config["exclude_numbers"]))
            
        if "fixed_numbers" in config and config["fixed_numbers"]:
            validators.append(FixNumbersValidator(config["fixed_numbers"]))
            
        return validators

    def _build_pool(self, lottery: Lottery, config: dict) -> list[int]:
        """Build the pool of available numbers."""
        all_numbers = set(range(lottery.min_number, lottery.max_number + 1))
        
        # Remove excluded
        excluded = set(config.get("exclude_numbers", []))
        pool = list(all_numbers - excluded)
        
        # Ensure fixed numbers are valid
        fixed = set(config.get("fixed_numbers", []))
        if not fixed.issubset(all_numbers):
            raise ValueError("Some fixed numbers are out of range.")
            
        # Ensure we have enough numbers
        if len(pool) < self.numbers_count:
            raise ValueError("Not enough numbers in pool to generate games.")
            
        return pool

    def _generate_candidate(self) -> list[int]:
        """Generate a single random candidate."""
        # Start with fixed numbers
        current = list(self.fixed_numbers)
        remaining_count = self.numbers_count - len(current)
        
        if remaining_count <= 0:
            return current[:self.numbers_count] # Edge case if fixed > required
            
        # Select random from pool (excluding already fixed)
        available_pool = [n for n in self.pool if n not in self.fixed_numbers]
        
        # Check if possible
        if len(available_pool) < remaining_count:
             # Should be caught by _build_pool but double check
             raise ValueError("Not enough numbers available.")
             
        # Sample
        random_part = random.sample(available_pool, remaining_count)
        return current + random_part

    def _validate_candidate(self, numbers: list[int]) -> bool:
        """Run all validators."""
        for validator in self.validators:
            if not validator.validate(numbers):
                return False
        return True

    def _calculate_score(self, numbers: list[int]) -> float:
        """Calculate a heuristic score (0-10) for the game."""
        # Simple heuristic: balance
        # Better implementation would use StatsService to check historical probability
        
        metrics = StatsCalculator.calculate_metrics(numbers)
        
        score = 10.0
        
        # Penalty for too many evens/odds (if not strictly validated)
        # Only apply soft penalties here
        
        return score
