/**
 * Exemplo de componente consumindo dados REAIS da API Django
 * Substitui o mock data anterior
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LotteryBall } from "./LotteryBall";
import { Calendar, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLatestDraw, useLottery } from "@/features/lotteries/hooks/useLotteryData";
import { formatCurrency, formatDate } from "@/lib/lottery-utils";

interface RealLotteryCardProps {
    slug: string; // Agora recebe slug ao invés de objeto completo
    className?: string;
}

export function RealLotteryCard({ slug, className }: RealLotteryCardProps) {
    // Hook para buscar dados da loteria
    const { data: lottery, isLoading: lotteryLoading } = useLottery(slug);

    // Hook para buscar último sorteio
    const { data: latestDraw, isLoading: drawLoading, error } = useLatestDraw(slug);

    // Loading state
    if (lotteryLoading || drawLoading) {
        return (
            <Card className={cn("overflow-hidden", className)}>
                <CardContent className="p-8 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error || !lottery || !latestDraw) {
        return (
            <Card className={cn("overflow-hidden border-destructive", className)}>
                <CardContent className="p-8 text-center text-destructive">
                    <p>Erro ao carregar dados da loteria</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                "overflow-hidden hover-lift border-0 shadow-flat hover:shadow-flat-md transition-all",
                className
            )}
        >
            <CardHeader
                className="p-4 text-primary-foreground"
                style={{ backgroundColor: lottery.color }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="font-bold text-lg font-serif">{lottery.name}</h1>
                            <p className="text-sm opacity-90">Concurso {latestDraw.number}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-sm opacity-90">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(latestDraw.draw_date)}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4">
                {/* Numbers - DADOS REAIS DO BACKEND */}
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {latestDraw.numbers.map((num, index) => (
                        <LotteryBall
                            key={index}
                            number={num}
                            color={slug} // Usa slug como cor
                            size="md"
                            delay={index * 100}
                        />
                    ))}
                </div>

                {/* Prize info - VALOR REAL */}
                <div className="flex items-center justify-center gap-2 pt-3 border-t border-border">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Próximo concurso:</span>
                    <span className="font-bold text-foreground">
                        {formatCurrency(parseFloat(latestDraw.next_draw_estimate))}
                    </span>
                </div>

                {/* Acumulado */}
                {latestDraw.is_accumulated && (
                    <div className="mt-2 text-center">
                        <span className="text-xs text-destructive font-semibold">
                            ACUMULOU! {formatCurrency(parseFloat(latestDraw.accumulated_value))}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
