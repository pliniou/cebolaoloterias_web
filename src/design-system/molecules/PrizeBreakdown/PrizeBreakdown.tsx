/**
 * PrizeBreakdown - Molécula para breakdown de premiação por faixa
 * Compõe StatusBadge + PrizeLabel
 */

import { PrizeLabel } from '@/design-system/atoms/PrizeLabel';
import { cn } from '@/lib/utils';

export interface PrizeTierItem {
    tier: number;
    description: string;
    winners: number;
    prizeValue: number;
}

export interface PrizeBreakdownProps {
    /** Faixas de premiação */
    tiers: PrizeTierItem[];
    /** Classe CSS adicional */
    className?: string;
}

/**
 * PrizeBreakdown - Exibe detalhamento de premiação
 * 
 * @example
 * <PrizeBreakdown
 *   tiers={[
 *     { tier: 1, description: '6 acertos', winners: 2, prizeValue: 50000000 },
 *     { tier: 2, description: '5 acertos', winners: 120, prizeValue: 50000 },
 *   ]}
 * />
 */
export const PrizeBreakdown = ({ tiers, className }: PrizeBreakdownProps) => {
    return (
        <div className={cn('space-y-2', className)}>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                Rateio de Prêmios
            </h4>

            {tiers.map((tier) => (
                <div
                    key={tier.tier}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                    <div className="flex-1">
                        <p className="font-medium text-sm">{tier.description}</p>
                        <p className="text-xs text-muted-foreground">
                            {tier.winners === 0 ? 'Nenhum ganhador' : `${tier.winners} ganhador${tier.winners > 1 ? 'es' : ''}`}
                        </p>
                    </div>

                    <PrizeLabel
                        value={tier.prizeValue}
                        size="sm"
                        variant={tier.tier === 1 ? 'primary' : 'default'}
                    />
                </div>
            ))}
        </div>
    );
};

PrizeBreakdown.displayName = 'PrizeBreakdown';
