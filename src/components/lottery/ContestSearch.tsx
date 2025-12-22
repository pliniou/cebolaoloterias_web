import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult, formatCurrency, formatDate } from "@/lib/lottery-types";
import { LotteryInfo } from "@/lib/lotteries";
import { 
  Search, 
  X, 
  Loader2, 
  MapPin, 
  Calendar,
  AlertCircle 
} from "lucide-react";

interface ContestSearchProps {
  lottery: LotteryInfo;
  searchResult: LotteryResult | null;
  isSearching: boolean;
  searchError: string | null;
  onSearch: (contestNumber: number) => void;
  onClear: () => void;
}

export function ContestSearch({
  lottery,
  searchResult,
  isSearching,
  searchError,
  onSearch,
  onClear,
}: ContestSearchProps) {
  const [contestInput, setContestInput] = useState("");

  const handleSearch = () => {
    const contestNumber = parseInt(contestInput, 10);
    if (!isNaN(contestNumber) && contestNumber > 0) {
      onSearch(contestNumber);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleClear = () => {
    setContestInput("");
    onClear();
  };

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Search className="h-5 w-5 text-primary" />
          Buscar Concurso
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="number"
              placeholder="Digite o número do concurso..."
              value={contestInput}
              onChange={(e) => setContestInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10"
              min={1}
            />
            {contestInput && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button 
            onClick={handleSearch}
            disabled={!contestInput || isSearching}
            style={{ backgroundColor: `hsl(var(--${lottery.color}))` }}
            className="text-primary-foreground"
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Buscar</span>
          </Button>
        </div>

        {/* Error state */}
        {searchError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{searchError}</span>
          </div>
        )}

        {/* Search result */}
        {searchResult && !searchError && (
          <div className="animate-fade-in">
            <Separator className="my-4" />
            
            <div className="space-y-3">
              {/* Result header */}
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold">Concurso {searchResult.contestNumber}</h4>
                <Badge variant="outline" className="text-xs">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(searchResult.date)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  {searchResult.location.city} - {searchResult.location.state}
                </Badge>
              </div>

              {/* Numbers */}
              <div className="flex flex-wrap gap-2 py-2">
                {searchResult.numbers.slice(0, 20).map((num, index) => (
                  <LotteryBall
                    key={index}
                    number={num}
                    color={lottery.color}
                    size="md"
                    delay={index * 50}
                  />
                ))}
              </div>

              {/* Prize info */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Prêmio: </span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(searchResult.estimatedPrize)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ganhadores: </span>
                  <span className="font-semibold">
                    {searchResult.prizes[0]?.winners > 0 
                      ? searchResult.prizes[0].winners 
                      : "Acumulou"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
