// Types prepared for REST API consumption

export interface LotteryResult {
  contestNumber: number;
  date: string;
  numbers: number[];
  specialNumbers?: number[]; // For lotteries with additional draws (trevos, months, etc.)
  location: {
    city: string;
    state: string;
  };
  isAccumulated: boolean;
  accumulatedValue: number;
  estimatedPrize: number;
  prizes: PrizeBreakdown[];
  nextContestDate?: string;
  nextEstimatedPrize?: number;
}

export interface PrizeBreakdown {
  tier: string; // e.g., "Sena", "Quina", "Quadra"
  winners: number;
  prizePerWinner: number;
  totalPrize: number;
}

export interface LotteryHistoryParams {
  lotterySlug: string;
  page: number;
  pageSize: number;
  startDate?: string;
  endDate?: string;
  contestNumber?: number;
}

export interface LotteryHistoryResponse {
  results: LotteryResult[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

export interface LotterySearchParams {
  lotterySlug: string;
  contestNumber: number;
}

// Format helpers
export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// Mock data generator for development
export function generateMockResult(
  lotterySlug: string,
  contestNumber: number,
  numbersCount: number,
  range: [number, number]
): LotteryResult {
  const numbers: number[] = [];
  const count = Math.min(numbersCount, 20);
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (range[1] - range[0] + 1)) + range[0];
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }

  const cities = [
    { city: "São Paulo", state: "SP" },
    { city: "Rio de Janeiro", state: "RJ" },
    { city: "Belo Horizonte", state: "MG" },
    { city: "Salvador", state: "BA" },
    { city: "Brasília", state: "DF" },
  ];

  const randomLocation = cities[Math.floor(Math.random() * cities.length)];
  const isAccumulated = Math.random() > 0.6;
  const basePrize = Math.random() * 50000000 + 1000000;

  return {
    contestNumber,
    date: new Date(Date.now() - (2800 - contestNumber) * 3 * 24 * 60 * 60 * 1000).toISOString(),
    numbers: numbers.sort((a, b) => a - b),
    location: randomLocation,
    isAccumulated,
    accumulatedValue: isAccumulated ? basePrize * 1.2 : 0,
    estimatedPrize: basePrize,
    prizes: generateMockPrizes(lotterySlug, isAccumulated),
    nextContestDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextEstimatedPrize: basePrize * 1.1,
  };
}

function generateMockPrizes(lotterySlug: string, isAccumulated: boolean): PrizeBreakdown[] {
  const tiers: Record<string, string[]> = {
    megasena: ["Sena", "Quina", "Quadra"],
    quina: ["Quina", "Quadra", "Terno", "Duque"],
    lotofacil: ["15 acertos", "14 acertos", "13 acertos", "12 acertos", "11 acertos"],
    lotomania: ["20 acertos", "19 acertos", "18 acertos", "17 acertos", "16 acertos", "0 acertos"],
    duplasena: ["Sena 1º", "Sena 2º", "Quina", "Quadra", "Terno"],
    timemania: ["7 acertos", "6 acertos", "5 acertos", "4 acertos", "3 acertos", "Time do Coração"],
    diadesorte: ["7 acertos", "6 acertos", "5 acertos", "4 acertos", "Mês da Sorte"],
    supersete: ["7 colunas", "6 colunas", "5 colunas", "4 colunas", "3 colunas"],
    federal: ["1º Prêmio", "2º Prêmio", "3º Prêmio", "4º Prêmio", "5º Prêmio"],
    loteca: ["14 pontos", "13 pontos", "12 pontos"],
    maismilionaria: ["6+2", "6+1", "6+0", "5+2", "5+1", "5+0"],
  };

  const tierNames = tiers[lotterySlug] || ["1º", "2º", "3º"];

  return tierNames.map((tier, index) => {
    const winners = index === 0 && isAccumulated ? 0 : Math.floor(Math.random() * 50);
    const basePrize = (10000000 / (index + 1)) * (Math.random() * 0.5 + 0.75);
    
    return {
      tier,
      winners,
      prizePerWinner: winners > 0 ? basePrize / winners : basePrize,
      totalPrize: basePrize,
    };
  });
}

export function generateMockHistory(
  lotterySlug: string,
  numbersCount: number,
  range: [number, number],
  page: number = 1,
  pageSize: number = 10
): LotteryHistoryResponse {
  const totalItems = 100;
  const results: LotteryResult[] = [];
  const startContest = 2800 - (page - 1) * pageSize;

  for (let i = 0; i < pageSize; i++) {
    results.push(generateMockResult(lotterySlug, startContest - i, numbersCount, range));
  }

  return {
    results,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalItems / pageSize),
      totalItems,
      pageSize,
    },
  };
}
