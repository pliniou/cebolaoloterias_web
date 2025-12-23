"""
Validators for lottery generation.

Each validator checks if a set of numbers meets specific criteria.
"""

from abc import ABC, abstractmethod

from apps.stats.services.calculator import StatsCalculator


class BaseValidator(ABC):
    """Base class for validators."""

    @abstractmethod
    def validate(self, numbers: list[int]) -> bool:
        """Check if numbers meet the criteria."""
        pass

    @abstractmethod
    def get_description(self) -> str:
        """Get human-readable description of the rule."""
        pass


class SumValidator(BaseValidator):
    """Validates sum of numbers."""

    def __init__(self, min_sum: int | None = None, max_sum: int | None = None):
        self.min_sum = min_sum
        self.max_sum = max_sum

    def validate(self, numbers: list[int]) -> bool:
        total = sum(numbers)
        if self.min_sum is not None and total < self.min_sum:
            return False
        if self.max_sum is not None and total > self.max_sum:
            return False
        return True

    def get_description(self) -> str:
        parts = []
        if self.min_sum is not None:
            parts.append(f"min {self.min_sum}")
        if self.max_sum is not None:
            parts.append(f"max {self.max_sum}")
        return f"Soma: {', '.join(parts)}"


class EvenOddValidator(BaseValidator):
    """Validates count of even numbers."""

    def __init__(self, min_even: int | None = None, max_even: int | None = None):
        self.min_even = min_even
        self.max_even = max_even

    def validate(self, numbers: list[int]) -> bool:
        evens = StatsCalculator.count_evens(numbers)
        if self.min_even is not None and evens < self.min_even:
            return False
        if self.max_even is not None and evens > self.max_even:
            return False
        return True

    def get_description(self) -> str:
        parts = []
        if self.min_even is not None:
            parts.append(f"min {self.min_even}")
        if self.max_even is not None:
            parts.append(f"max {self.max_even}")
        return f"Pares: {', '.join(parts)}"


class PrimeValidator(BaseValidator):
    """Validates count of prime numbers."""

    def __init__(self, min_primes: int | None = None, max_primes: int | None = None):
        self.min_primes = min_primes
        self.max_primes = max_primes

    def validate(self, numbers: list[int]) -> bool:
        primes = StatsCalculator.count_primes(numbers)
        if self.min_primes is not None and primes < self.min_primes:
            return False
        if self.max_primes is not None and primes > self.max_primes:
            return False
        return True

    def get_description(self) -> str:
        parts = []
        if self.min_primes is not None:
            parts.append(f"min {self.min_primes}")
        if self.max_primes is not None:
            parts.append(f"max {self.max_primes}")
        return f"Primos: {', '.join(parts)}"


class ExclusionValidator(BaseValidator):
    """Ensures specific numbers are NOT present."""

    def __init__(self, excluded_numbers: list[int]):
        self.excluded_set = set(excluded_numbers)

    def validate(self, numbers: list[int]) -> bool:
        # Check intersection
        if set(numbers) & self.excluded_set:
            return False
        return True

    def get_description(self) -> str:
        return f"Excluir: {sorted(self.excluded_set)}"


class FixNumbersValidator(BaseValidator):
    """Ensures specific numbers ARE present."""

    def __init__(self, fixed_numbers: list[int]):
        self.fixed_set = set(fixed_numbers)

    def validate(self, numbers: list[int]) -> bool:
        # Check if all fixed numbers are present
        return self.fixed_set.issubset(set(numbers))

    def get_description(self) -> str:
        return f"Fixar: {sorted(self.fixed_set)}"
