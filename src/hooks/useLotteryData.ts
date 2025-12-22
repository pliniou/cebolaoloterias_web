import { useState, useCallback } from "react";
import { 
  LotteryResult, 
  LotteryHistoryResponse,
  generateMockResult,
  generateMockHistory 
} from "@/lib/lottery-types";
import { LotteryInfo } from "@/lib/lotteries";

interface UseLotteryDataReturn {
  latestResult: LotteryResult | null;
  searchResult: LotteryResult | null;
  history: LotteryHistoryResponse | null;
  isLoading: boolean;
  isSearching: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  searchError: string | null;
  fetchLatestResult: () => Promise<void>;
  searchByContest: (contestNumber: number) => Promise<void>;
  fetchHistory: (page: number) => Promise<void>;
  clearSearch: () => void;
}

export function useLotteryData(lottery: LotteryInfo): UseLotteryDataReturn {
  const [latestResult, setLatestResult] = useState<LotteryResult | null>(null);
  const [searchResult, setSearchResult] = useState<LotteryResult | null>(null);
  const [history, setHistory] = useState<LotteryHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Fetch latest result
  // TODO: Replace with actual API call
  // Example: GET /api/lotteries/{slug}/latest
  const fetchLatestResult = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - replace with actual API call
      // const response = await fetch(`/api/lotteries/${lottery.slug}/latest`);
      // const data = await response.json();
      const mockResult = generateMockResult(
        lottery.slug,
        2800,
        lottery.numbers,
        lottery.range
      );
      
      setLatestResult(mockResult);
    } catch (err) {
      setError("Erro ao carregar resultado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, [lottery]);

  // Search by contest number
  // TODO: Replace with actual API call
  // Example: GET /api/lotteries/{slug}/contests/{contestNumber}
  const searchByContest = useCallback(async (contestNumber: number) => {
    if (contestNumber < 1) {
      setSearchError("Número do concurso inválido");
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    
    try {
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Mock - 20% chance of not finding
      if (Math.random() < 0.2 && contestNumber < 100) {
        setSearchError("Concurso não encontrado");
        setSearchResult(null);
        return;
      }
      
      // Mock data - replace with actual API call
      // const response = await fetch(`/api/lotteries/${lottery.slug}/contests/${contestNumber}`);
      // const data = await response.json();
      const mockResult = generateMockResult(
        lottery.slug,
        contestNumber,
        lottery.numbers,
        lottery.range
      );
      
      setSearchResult(mockResult);
    } catch (err) {
      setSearchError("Erro na busca. Tente novamente.");
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  }, [lottery]);

  // Fetch history with pagination
  // TODO: Replace with actual API call
  // Example: GET /api/lotteries/{slug}/history?page={page}&pageSize=10
  const fetchHistory = useCallback(async (page: number) => {
    setIsLoadingHistory(true);
    
    try {
      // Simulating API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Mock data - replace with actual API call
      // const response = await fetch(`/api/lotteries/${lottery.slug}/history?page=${page}&pageSize=10`);
      // const data = await response.json();
      const mockHistory = generateMockHistory(
        lottery.slug,
        lottery.numbers,
        lottery.range,
        page,
        10
      );
      
      setHistory(mockHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [lottery]);

  const clearSearch = useCallback(() => {
    setSearchResult(null);
    setSearchError(null);
  }, []);

  return {
    latestResult,
    searchResult,
    history,
    isLoading,
    isSearching,
    isLoadingHistory,
    error,
    searchError,
    fetchLatestResult,
    searchByContest,
    fetchHistory,
    clearSearch,
  };
}
