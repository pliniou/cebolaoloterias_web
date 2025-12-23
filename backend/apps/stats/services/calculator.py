"""
Metrics calculator service.

Pure logic for calculating lottery number metrics.
"""



class StatsCalculator:
    """Calculates metrics for lottery draws."""

    @staticmethod
    def calculate_metrics(numbers: list[int], previous_numbers: list[int] | None = None) -> dict:
        """
        Calculate all metrics for a set of numbers.

        Args:
            numbers: List of drawn numbers
            previous_numbers: List of numbers from the previous draw (optional)

        Returns:
            Dict containing all calculated metrics
        """
        if not numbers:
            return {
                "sum_value": 0,
                "even_count": 0,
                "odd_count": 0,
                "range_value": 0,
                "prime_count": 0,
                "consecutive_count": 0,
                "repeated_from_previous": 0,
            }

        sorted_numbers = sorted(numbers)

        return {
            "sum_value": sum(numbers),
            "even_count": StatsCalculator.count_evens(numbers),
            "odd_count": StatsCalculator.count_odds(numbers),
            "range_value": sorted_numbers[-1] - sorted_numbers[0],
            "prime_count": StatsCalculator.count_primes(numbers),
            "consecutive_count": StatsCalculator.count_consecutive_pairs(sorted_numbers),
            "repeated_from_previous": StatsCalculator.count_repeated(numbers, previous_numbers),
        }

    @staticmethod
    def is_prime(n: int) -> bool:
        """Check if a number is prime."""
        if n <= 1:
            return False
        if n <= 3:
            return True
        if n % 2 == 0 or n % 3 == 0:
            return False

        i = 5
        while i * i <= n:
            if n % i == 0 or n % (i + 2) == 0:
                return False
            i += 6

        return True

    @staticmethod
    def count_primes(numbers: list[int]) -> int:
        """Count prime numbers in the list."""
        return sum(1 for n in numbers if StatsCalculator.is_prime(n))

    @staticmethod
    def count_evens(numbers: list[int]) -> int:
        """Count even numbers."""
        return sum(1 for n in numbers if n % 2 == 0)

    @staticmethod
    def count_odds(numbers: list[int]) -> int:
        """Count odd numbers."""
        return sum(1 for n in numbers if n % 2 != 0)

    @staticmethod
    def count_consecutive_pairs(sorted_numbers: list[int]) -> int:
        """
        Count consecutive pairs in a sorted list.
        Example: [1, 2, 4, 5, 8] -> 2 pairs (1-2 and 4-5)
        """
        if len(sorted_numbers) < 2:
            return 0

        count = 0
        for i in range(len(sorted_numbers) - 1):
            if sorted_numbers[i] + 1 == sorted_numbers[i + 1]:
                count += 1
        return count

    @staticmethod
    def count_repeated(numbers: list[int], previous_numbers: list[int] | None) -> int:
        """Count numbers present in the previous draw."""
        if not previous_numbers:
            return 0

        current_set = set(numbers)
        previous_set = set(previous_numbers)

        return len(current_set & previous_set)
