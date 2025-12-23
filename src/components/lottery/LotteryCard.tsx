import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { LotteryInfo } from "@/lib/lotteries";
import { Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateRandomNumbers } from "@/lib/lottery-utils";

interface LotteryCardProps {
  lottery: LotteryInfo;
  numbers?: number[];
  contestNumber?: number;
  date?: string;
  className?: string;
}

export function LotteryCard({
  lottery,
  numbers = [],
  contestNumber = 2800,
  date = "21/12/2024",
  className,
}: LotteryCardProps) {
  const Icon = lottery.icon;

  // Generate random numbers if none provided
  const displayNumbers = numbers.length > 0
    ? numbers
    : generateRandomNumbers(lottery.numbers, lottery.range[0], lottery.range[1]);

  return (
    <Card className={cn("overflow-hidden hover-lift border-0 shadow-flat hover:shadow-flat-md transition-all", className)}>
      <CardHeader
        className="p-4 text-primary-foreground"
        style={{ backgroundColor: `hsl(var(--${lottery.color}))` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon className="h-6 w-6" />
            <div>
              <h1 className="font-bold text-lg font-serif">{lottery.name}</h1>
              <p className="text-sm opacity-90">Concurso {contestNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm opacity-90">
              <Calendar className="h-3.5 w-3.5" />
              <span>{date}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Numbers */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {displayNumbers.slice(0, 6).map((num, index) => (
            <LotteryBall
              key={index}
              number={num}
              color={lottery.color}
              size="md"
              delay={index * 100}
            />
          ))}
        </div>

        {/* Prize info */}
        {lottery.prize && (
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Prêmio estimado:</span>
            <span className="font-bold text-foreground">{lottery.prize}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
