import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { LotteryBall } from "./LotteryBall";
import { LotteryResult, formatCurrency, formatDate } from "@/lib/lottery-types";
import { LotteryInfo } from "@/lib/lotteries";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Banknote,
  AlertCircle 
} from "lucide-react";

interface LatestResultCardProps {
  lottery: LotteryInfo;
  result: LotteryResult | null;
  isLoading: boolean;
  error?: string | null;
}

export function LatestResultCard({ 
  lottery, 
  result, 
  isLoading,
  error 
}: LatestResultCardProps) {
  const Icon = lottery.icon;

  if (error) {
    return (
      <Card className="border-2 border-destructive/50">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px]">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !result) {
    return (
      <Card className="border-2">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3 justify-center py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-12 rounded-full" />
            ))}
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 overflow-hidden">
      {/* Header with lottery color */}
      <div 
        className="p-4 lg:p-6"
        style={{ backgroundColor: `hsl(var(--${lottery.color}))` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-foreground">{lottery.name}</h2>
              <p className="text-primary-foreground/80 text-sm">Concurso {result.contestNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(result.date)}
            </Badge>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0">
              <MapPin className="h-3 w-3 mr-1" />
              {result.location.city} - {result.location.state}
            </Badge>
          </div>
        </div>
      </div>

      <CardContent className="p-4 lg:p-6 space-y-4">
        {/* Numbers */}
        <div className="flex flex-wrap gap-3 justify-center py-4">
          {result.numbers.slice(0, 20).map((num, index) => (
            <LotteryBall
              key={index}
              number={num}
              color={lottery.color}
              size="lg"
              delay={index * 80}
            />
          ))}
        </div>

        <Separator />

        {/* Prize info - responsive grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Trophy className="h-4 w-4" />
              <span className="text-xs">Prêmio Principal</span>
            </div>
            <p className="text-lg lg:text-xl font-bold text-primary">
              {formatCurrency(result.estimatedPrize)}
            </p>
          </div>

          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
              <Banknote className="h-4 w-4" />
              <span className="text-xs">Ganhadores</span>
            </div>
            <p className="text-lg lg:text-xl font-bold">
              {result.prizes[0]?.winners > 0 
                ? `${result.prizes[0].winners} ganhador(es)` 
                : <span className="text-warning">Acumulou!</span>}
            </p>
          </div>

          {result.isAccumulated && (
            <div className="text-center p-3 rounded-lg bg-warning/10 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center gap-1 text-warning mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Acumulado</span>
              </div>
              <p className="text-lg lg:text-xl font-bold text-warning">
                {formatCurrency(result.accumulatedValue)}
              </p>
            </div>
          )}

          {result.nextEstimatedPrize && (
            <div className="text-center p-3 rounded-lg bg-primary/10 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">Próximo Prêmio</span>
              </div>
              <p className="text-lg lg:text-xl font-bold text-primary">
                {formatCurrency(result.nextEstimatedPrize)}
              </p>
            </div>
          )}
        </div>

        {/* Prize breakdown - collapsible on mobile */}
        {result.prizes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Premiação</h4>
            <div className="grid gap-2">
              {result.prizes.slice(0, 5).map((prize, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                >
                  <span className="font-medium">{prize.tier}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">
                      {prize.winners} ganhador(es)
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(prize.prizePerWinner)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
