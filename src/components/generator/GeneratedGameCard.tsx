import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GameStats, getGameStats } from "@/lib/generator-logic";
import { Save } from "lucide-react";
import { SavedGame, useSavedGames } from "@/lib/saved-games";
import { LotteryInfo } from "@/lib/lotteries";

interface GeneratedGameCardProps {
    numbers: number[];
    lottery: LotteryInfo;
    onSave: () => void;
    comparisonNumbers?: number[];
}

export function GeneratedGameCard({ numbers, lottery, onSave, comparisonNumbers }: GeneratedGameCardProps) {
    const stats = getGameStats(numbers);
    const repeated = comparisonNumbers ? numbers.filter(n => comparisonNumbers.includes(n)).length : undefined;

    return (
        <div className="bg-card border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex flex-wrap gap-1.5 mb-3 justify-center sm:justify-start">
                {numbers.map((num) => (
                    <span
                        key={num}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-medium border border-border"
                    >
                        {num.toString().padStart(2, "0")}
                    </span>
                ))}
            </div>

            <div className="flex flex-wrap gap-2 text-xs mb-4">
                <Badge variant="outline" className="font-normal text-muted-foreground">
                    {stats.evenCount} Pares
                </Badge>
                <Badge variant="outline" className="font-normal text-muted-foreground">
                    Soma {stats.sum}
                </Badge>
                <Badge variant="outline" className="font-normal text-muted-foreground">
                    Seq. Max {stats.consecutiveMax}
                </Badge>
                {repeated !== undefined && (
                    <Badge variant="outline" className="font-normal text-muted-foreground">
                        Repetidos: {repeated}
                    </Badge>
                )}
            </div>

            <Button size="sm" variant="ghost" className="w-full border border-dashed" onClick={onSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar em Meus Jogos
            </Button>
        </div>
    );
}
