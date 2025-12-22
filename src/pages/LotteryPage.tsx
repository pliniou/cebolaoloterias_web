import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { getLotteryBySlug } from "@/lib/lotteries";
import { useLotteryData } from "@/hooks/useLotteryData";
import { LatestResultCard } from "@/components/lottery/LatestResultCard";
import { ContestSearch } from "@/components/lottery/ContestSearch";
import { HistoryList } from "@/components/lottery/HistoryList";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function LotteryPage() {
  const { slug } = useParams<{ slug: string }>();
  const lottery = getLotteryBySlug(slug || "");
  const [currentPage, setCurrentPage] = useState(1);

  // Lottery not found
  if (!lottery) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loteria não encontrada</p>
        </div>
      </Layout>
    );
  }

  const {
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
  } = useLotteryData(lottery);

  // Fetch data on mount and when lottery changes
  useEffect(() => {
    fetchLatestResult();
    fetchHistory(1);
    setCurrentPage(1);
  }, [lottery.slug]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchHistory(page);
  };

  const Icon = lottery.icon;

  return (
    <Layout>
      <div className="p-4 lg:p-8 space-y-6 animate-fade-in">
        {/* Page Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
          style={{ backgroundColor: `hsl(var(--${lottery.color}))` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center">
                <Icon className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-primary-foreground">
                  {lottery.name}
                </h1>
                <p className="text-primary-foreground/80">{lottery.description}</p>
              </div>
            </div>
            {latestResult && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
                  <Calendar className="h-3 w-3 mr-1" />
                  Concurso {latestResult.contestNumber}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Block 1: Latest Result */}
        <LatestResultCard
          lottery={lottery}
          result={latestResult}
          isLoading={isLoading}
          error={error}
        />

        {/* Block 2: Contest Search */}
        <ContestSearch
          lottery={lottery}
          searchResult={searchResult}
          isSearching={isSearching}
          searchError={searchError}
          onSearch={searchByContest}
          onClear={clearSearch}
        />

        {/* Block 3: History List */}
        <HistoryList
          lottery={lottery}
          history={history}
          isLoading={isLoadingHistory}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  );
}
