import { SavedGame } from "@/lib/saved-games";
import { LotteryResult } from "@/lib/lottery-types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/lottery-types";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateMockResult } from "@/lib/lottery-types";

interface ConferenceResultsProps {
    game: SavedGame;
    result: LotteryResult;
}

export function ConferenceResults({ game, result }: ConferenceResultsProps) {
    const [historyOpen, setHistoryOpen] = useState(false);
    const [historyStats, setHistoryStats] = useState<{ matches: number[], totalPrize: number } | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    const matches = game.numbers.filter((num) => result.numbers.includes(num));
    const hits = matches.length;

    // Simple prize logic based on hits (simplified for demo)
    // Ideally this should check against the `prizes` array in `result` but that often requires knowing the Tier Name logic which varies.
    // We can try to match simpler logic or just show hits.
    // Let's try to match with result.prizes if possible.

    let prizeTier = null;
    let prizeValue = 0;

    // Heuristic matching for demo purposes
    // Real implementation would need specific rules per lottery
    const matchedPrize = result.prizes.find(p => {
        // Typically tier names contain the number of hits e.g. "15 acertos" or "Sena" (6)
        if (p.tier.includes(hits.toString())) return true;
        // For specific names
        if (game.lotterySlug === 'megasena' && hits === 6 && p.tier === 'Sena') return true;
        if (game.lotterySlug === 'megasena' && hits === 5 && p.tier === 'Quina') return true;
        if (game.lotterySlug === 'megasena' && hits === 4 && p.tier === 'Quadra') return true;
        // Quina
        if (game.lotterySlug === 'quina' && hits === 5 && p.tier === 'Quina') return true;
        if (game.lotterySlug === 'quina' && hits === 4 && p.tier === 'Quadra') return true;
        if (game.lotterySlug === 'quina' && hits === 3 && p.tier === 'Terno') return true;
        if (game.lotterySlug === 'quina' && hits === 2 && p.tier === 'Duque') return true;

        return false;
    });

    if (matchedPrize) {
        prizeTier = matchedPrize.tier;
        prizeValue = matchedPrize.prizePerWinner;
    }

    const isWin = !!matchedPrize;

    const calculateHistory = () => {
        setIsCalculating(true);
        setTimeout(() => {
            let totalPrize = 0;
            const matchesCount: number[] = [];

            // Simulate checking against last 20 contests
            for (let i = 0; i < 20; i++) {
                // Mock a past result
                const pastResult = generateMockResult(
                    game.lotterySlug,
                    result.contestNumber - (i + 1),
                    result.numbers.length,
                    // We need the range, let's assume standard from current numbers or look it up.
                    // Ideally we pass lottery info down, but for now we can infer or hardcode based on slug or minimal range 
                    [1, Math.max(...game.numbers, 60)]
                );

                const pastHits = game.numbers.filter(n => pastResult.numbers.includes(n)).length;
                if (pastHits >= 3) { // Only care about meaningful hits
                    matchesCount.push(pastHits);
                    // Mock prize accumulation
                    if (pastHits > 3) totalPrize += 100 * pastHits;
                }
            }

            setHistoryStats({ matches: matchesCount, totalPrize });
            setIsCalculating(false);
        }, 1000);
    };

    return (
        <Card className={`mb-4 ${isWin ? 'border-yellow-500 bg-yellow-50/10' : ''}`}>
            <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{game.name || "Jogo Salvo"}</span>
                        {game.tags.map(t => <Badge key={t} variant="outline" className="text-[10px] h-5">{t}</Badge>)}
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {game.numbers.map(num => {
                            const isMatch = result.numbers.includes(num);
                            return (
                                <span
                                    key={num}
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border 
                            ${isMatch
                                            ? "bg-green-500 text-white border-green-600"
                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-transparent"
                                        }`}
                                >
                                    {num.toString().padStart(2, '0')}
                                </span>
                            )
                        })}
                    </div>
                </div>

                <div className="flex flex-col items-end min-w-[120px]">
                    <div className="text-xl font-bold flex items-center gap-2">
                        {hits} Acertos
                        {isWin ? <Trophy className="h-5 w-5 text-yellow-500" /> : <div className="w-5" />}
                    </div>
                    {isWin ? (
                        <div className="text-right">
                            <span className="text-sm font-medium text-green-600 block">{prizeTier}</span>
                            <span className="text-sm font-bold text-green-700">{formatCurrency(prizeValue)}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground mt-1 block mb-2">Não premiado neste concurso</span>
                    )}

                    <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full mt-2" onClick={calculateHistory}>
                                Ver Histórico
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Histórico de Resultados</DialogTitle>
                                <DialogDescription>
                                    Simulação dos últimos 20 concursos para este jogo.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                {isCalculating ? (
                                    <div className="flex justify-center py-8">
                                        <span className="animate-pulse text-muted-foreground">Calculando resultados históricos...</span>
                                    </div>
                                ) : historyStats ? (
                                    <div className="text-center">
                                        <p className="mb-4">
                                            Nos últimos 20 concursos, este jogo teria premiado:
                                        </p>
                                        <div className="flex justify-center gap-4 mb-6">
                                            {historyStats.matches.length > 0 ? (
                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {historyStats.matches.sort((a, b) => b - a).map((m, i) => (
                                                        <Badge key={i} variant="secondary">{m} acertos</Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Nenhuma premiação encontrada.</span>
                                            )}
                                        </div>

                                        {historyStats.totalPrize > 0 && (
                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                <span className="text-sm text-muted-foreground block">Lucro Estimado</span>
                                                <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                    {formatCurrency(historyStats.totalPrize)}
                                                </span>
                                                <span className="text-xs text-muted-foreground block mt-1">*Valores aproximados</span>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
