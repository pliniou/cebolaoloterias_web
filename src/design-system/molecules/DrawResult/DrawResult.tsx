/**
 * DrawResult - Molécula para exibir resultado de sorteio
 * Compõe NumberBall + LotteryBadge + informações do concurso
 */

import { NumberBall } from '@/design-system/atoms/NumberBall';
import { LotteryBadge } from '@/design-system/atoms/LotteryBadge';
import { Calendar } from 'lucide-react';
import { formatDate } from '@/lib/lottery-utils';

export interface DrawResultProps {
    /** Slug da loteria */
    lotterySlug: string;
    /** Nome da loteria */
    lotteryName: string;
    /** Número do concurso */
    drawNumber: number;
    /** Data do sorteio (ISO string) */
    drawDate: string;
    /** Números sorteados */
    numbers: number[];
    /** Classe CSS adicional */
    className?: string;
}

/**
 * DrawResult - Molécula que exibe resultado completo de um sorteio
 * 
 * @example
 * <DrawResult
 *   lotterySlug="megasena"
 *   lotteryName="Mega-Sena"
 *   drawNumber={2789}
 *   drawDate="2025-12-23"
 *   numbers={[5, 12, 23, 34, 45, 58]}
 * />
 */
export const DrawResult = ({
    lotterySlug,
    lotteryName,
    drawNumber,
    drawDate,
    numbers,
    className,
}: DrawResultProps) => {
    return (
        <div className={className}>
            {/* Header com badge e data */}
            <div className="flex items-center justify-between mb-4">
                <LotteryBadge name={lotteryName} lottery={lotterySlug as any} />
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(drawDate)}</span>
                </div>
            </div>

            {/* Número do concurso */}
            <p className="text-sm text-muted-foreground mb-3">
                Concurso {drawNumber}
            </p>

            {/* Números sorteados */}
            <div className="flex flex-wrap gap-2 justify-center">
                {numbers.map((num, index) => (
                    <NumberBall
                        key={index}
                        number={num}
                        lottery={lotterySlug as any}
                        size="md"
                        delay={index * 100}
                        animated
                    />
                ))}
            </div>
        </div>
    );
};

DrawResult.displayName = 'DrawResult';
