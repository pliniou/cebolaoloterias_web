"""
HTTP client for CAIXA Lottery API.

Fetches lottery results from the official CAIXA API.
API Base: https://servicebus2.caixa.gov.br/portaldeloterias/api/
"""

import logging
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal
from typing import Any

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


@dataclass
class DrawResult:
    """Parsed draw result from CAIXA API."""

    number: int
    draw_date: date
    numbers: list[int]
    numbers_draw_order: list[int] | None
    is_accumulated: bool
    accumulated_value: Decimal
    next_draw_estimate: Decimal
    total_revenue: Decimal
    location: str
    city_state: str
    next_draw_number: int | None
    next_draw_date: date | None
    prize_tiers: list[dict[str, Any]]
    raw_data: dict[str, Any]


class CaixaLotteryClient:
    """
    HTTP client for fetching lottery results from CAIXA API.

    Usage:
        client = CaixaLotteryClient()
        result = client.get_latest_result("megasena")
        result = client.get_result_by_number("megasena", 2954)
    """

    BASE_URL = "https://servicebus2.caixa.gov.br/portaldeloterias/api"
    TIMEOUT = 30  # seconds

    def __init__(self):
        """Initialize the client with retry configuration."""
        self.session = requests.Session()

        # Configure retries
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)

        # Set headers
        self.session.headers.update({
            "Accept": "application/json",
            "User-Agent": "CebolaLoterias/1.0",
        })

    def get_latest_result(self, lottery_slug: str) -> DrawResult:
        """
        Fetch the latest draw result for a lottery.

        Args:
            lottery_slug: API identifier for the lottery (e.g., "megasena")

        Returns:
            Parsed DrawResult object

        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response cannot be parsed
        """
        url = f"{self.BASE_URL}/{lottery_slug}"
        return self._fetch_and_parse(url, lottery_slug)

    def get_result_by_number(self, lottery_slug: str, number: int) -> DrawResult:
        """
        Fetch a specific draw result by contest number.

        Args:
            lottery_slug: API identifier for the lottery
            number: Contest number

        Returns:
            Parsed DrawResult object
        """
        url = f"{self.BASE_URL}/{lottery_slug}/{number}"
        return self._fetch_and_parse(url, lottery_slug)

    def _fetch_and_parse(self, url: str, lottery_slug: str) -> DrawResult:
        """Fetch data from URL and parse into DrawResult."""
        logger.info(f"Fetching lottery data from: {url}")

        response = self.session.get(url, timeout=self.TIMEOUT)
        response.raise_for_status()

        data = response.json()
        logger.debug(f"Received data for contest {data.get('numero')}")

        return self._parse_response(data, lottery_slug)

    def _parse_response(self, data: dict[str, Any], lottery_slug: str) -> DrawResult:
        """Parse CAIXA API response into DrawResult."""
        # Parse numbers
        numbers = self._parse_numbers(data.get("listaDezenas", []))

        # Special handling for Federal
        if lottery_slug == "federal" and not numbers:
            # Federal doesn't have "listaDezenas", we extract from prize tiers (bilhetes)
            # Usually order is 1st to 5th prize
            prizes = data.get("listaRateioPremio", [])
            numbers = []
            for prize in prizes:
                ticket = prize.get("numeroBilhete")
                # Sometimes ticket comes as integer or string
                if ticket:
                    # Clean and ensure int
                    try:
                        clean_ticket = int(str(ticket).replace(".", "").strip())
                        numbers.append(clean_ticket)
                    except (ValueError, TypeError):
                        continue
            # Sort or keep order? Federal prizes have hierarchy, but Draw.numbers usually expects sorted
            # for matching. However, for Federal, matching rules are specific.
            # We'll store them as is (usually 5 numbers).

        numbers_draw_order = self._parse_numbers(
            data.get("dezenasSorteadasOrdemSorteio", [])
        )

        # Special handling for Super Sete (cols) is usually automatic via listaDezenas

        # Parse dates
        draw_date = self._parse_date(data.get("dataApuracao", ""))
        next_draw_date = self._parse_date(data.get("dataProximoConcurso", ""))

        # Parse prize tiers
        prize_tiers = self._parse_prize_tiers(data.get("listaRateioPremio", []))

        # Clean location string (may contain null characters)
        city_state = data.get("nomeMunicipioUFSorteio", "")
        if city_state:
            city_state = city_state.replace("\x00", "").strip()

        # Create result object
        return DrawResult(
            number=data.get("numero", 0),
            draw_date=draw_date,
            numbers=numbers,
            numbers_draw_order=numbers_draw_order if numbers_draw_order else None,
            is_accumulated=data.get("acumulado", False),
            accumulated_value=Decimal(str(data.get("valorAcumuladoProximoConcurso", 0))),
            next_draw_estimate=Decimal(str(data.get("valorEstimadoProximoConcurso", 0))),
            total_revenue=Decimal(str(data.get("valorArrecadado", 0))),
            location=data.get("localSorteio", ""),
            city_state=city_state,

            next_draw_number=data.get("numeroConcursoProximo"),
            next_draw_date=next_draw_date,
            prize_tiers=prize_tiers,
            raw_data=data,
        )

    def _parse_date(self, date_str: str) -> date | None:
        """Parse date string from DD/MM/YYYY format."""
        if not date_str:
            return None
        try:
            return datetime.strptime(date_str, "%d/%m/%Y").date()
        except ValueError:
            logger.warning(f"Could not parse date: {date_str}")
            return None

    def _parse_numbers(self, numbers: list[str]) -> list[int]:
        """Parse list of number strings into integers."""
        if not numbers:
            return []
        try:
            return [int(n) for n in numbers]
        except (ValueError, TypeError):
            logger.warning(f"Could not parse numbers: {numbers}")
            return []

    def _parse_prize_tiers(self, tiers: list[dict]) -> list[dict[str, Any]]:
        """Parse prize tier data."""
        parsed = []
        for tier in tiers or []:
            parsed.append({
                "tier": tier.get("faixa", 0),
                "description": tier.get("descricaoFaixa", ""),
                "winners_count": tier.get("numeroDeGanhadores", 0),
                "prize_value": Decimal(str(tier.get("valorPremio", 0))),
            })
        return parsed
