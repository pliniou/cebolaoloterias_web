/**
 * LotteryNav - Molécula para navegação horizontal entre loterias
 * Compõe LotteryBadge + IconButton
 */

import { LotteryBadge } from '@/design-system/atoms/LotteryBadge';
import { IconButton } from '@/design-system/atoms/IconButton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LotteryNavItem {
    slug: string;
    name: string;
}

export interface LotteryNavProps {
    /** Loterias disponíveis */
    lotteries: LotteryNavItem[];
    /** Loteria atualmente selecionada */
    currentSlug: string;
    /** Callback ao mudar loteria */
    onLotteryChange: (slug: string) => void;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * LotteryNav - Navegação horizontal entre loterias
 * 
 * @example
 * <LotteryNav
 *   lotteries={[
 *     { slug: 'megasena', name: 'Mega-Sena' },
 *     { slug: 'lotofacil', name: 'Lotofácil' },
 *   ]}
 *   currentSlug="megasena"
 *   onLotteryChange={handleChange}
 * />
 */
export const LotteryNav = ({
    lotteries,
    currentSlug,
    onLotteryChange,
    className,
}: LotteryNavProps) => {
    const currentIndex = lotteries.findIndex((l) => l.slug === currentSlug);
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < lotteries.length - 1;

    const handlePrevious = () => {
        if (hasPrevious) {
            onLotteryChange(lotteries[currentIndex - 1]!.slug);
        }
    };

    const handleNext = () => {
        if (hasNext) {
            onLotteryChange(lotteries[currentIndex + 1]!.slug);
        }
    };

    const currentLottery = lotteries[currentIndex];

    if (!currentLottery) return null;

    return (
        <div className={cn('flex items-center justify-between gap-4', className)}>
            <IconButton
                icon={ChevronLeft}
                aria-label="Loteria anterior"
                onClick={handlePrevious}
                disabled={!hasPrevious}
                variant="outline"
                size="sm"
            />

            <div className="flex-1 flex items-center justify-center">
                <LotteryBadge
                    name={currentLottery.name}
                    lottery={currentLottery.slug as any}
                    variant="solid"
                />
            </div>

            <IconButton
                icon={ChevronRight}
                aria-label="Próxima loteria"
                onClick={handleNext}
                disabled={!hasNext}
                variant="outline"
                size="sm"
            />
        </div>
    );
};

LotteryNav.displayName = 'LotteryNav';
