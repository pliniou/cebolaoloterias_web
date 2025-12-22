import { useState } from "react";
import { useSavedGames } from "@/lib/saved-games";
import { lotteries, getLotteryBySlug } from "@/lib/lotteries";
import { generateMockResult, LotteryResult, formatDate } from "@/lib/lottery-types";
import { ConferenceResults } from "@/components/ConferenceResults";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Conference() {
    const { games, getGamesByLottery } = useSavedGames();
    const [selectedLotterySlug, setSelectedLotterySlug] = useState<string>(lotteries[0].slug);
    const [result, setResult] = useState<LotteryResult | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedLottery = getLotteryBySlug(selectedLotterySlug);
    const savedGames = getGamesByLottery(selectedLotterySlug);

    const handleCheck = async () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            // Mock result for the latest contest (using a high number to simulate latest)
            const mockResult = generateMockResult(selectedLotterySlug, 2800, selectedLottery?.numbers || 6, selectedLottery?.range || [1, 60]);
            setResult(mockResult);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Conferência</h1>
                <p className="text-muted-foreground">
                    Compare seus jogos salvos com os resultados mais recentes.
                </p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração da Conferência</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="grid gap-2 flex-1 w-full sm:w-auto">
                            <label className="text-sm font-medium">Loteria</label>
                            <Select
                                value={selectedLotterySlug}
                                onValueChange={(val) => {
                                    setSelectedLotterySlug(val);
                                    setResult(null); // Reset result on change
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {lotteries.map((l) => (
                                        <SelectItem key={l.slug} value={l.slug}>
                                            {l.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleCheck}
                            disabled={loading || savedGames.length === 0}
                            className="w-full sm:w-auto"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Conferir Jogos ({savedGames.length})
                        </Button>
                    </CardContent>
                </Card>

                {result && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="bg-muted p-4 rounded-lg border flex flex-col sm:flex-row justify-between items-center text-center sm:text-left gap-4">
                            <div>
                                <h3 className="font-bold text-lg">{selectedLottery?.name} - Concurso {result.contestNumber}</h3>
                                <p className="text-sm text-muted-foreground">{formatDate(result.date)}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-muted-foreground block mb-1">Dezenas Sorteadas</span>
                                <div className="flex gap-2 justify-center sm:justify-end flex-wrap">
                                    {result.numbers.map(n => (
                                        <span key={n} className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-bold shadow-sm">
                                            {n.toString().padStart(2, '0')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-semibold text-xl mb-4">Seus Resultados</h3>
                            {savedGames.map(game => (
                                <ConferenceResults key={game.id} game={game} result={result} />
                            ))}
                        </div>
                    </div>
                )}

                {!result && !loading && savedGames.length > 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Clique em "Conferir Jogos" para ver os resultados.</p>
                    </div>
                )}

                {savedGames.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                        <p>Você não tem jogos salvos para esta loteria.</p>
                        <Button variant="link" asChild className="mt-2">
                            <a href="/meus-jogos">Criar jogos em Meus Jogos</a>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
