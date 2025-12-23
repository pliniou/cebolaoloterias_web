/**
 * LotteryBadge - Átomo para identificação visual de loterias
 * Badge com cor e ícone característicos de cada loteria
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const badgeVariants = cva(
    'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
    {
        variants: {
            lottery: {
                megasena: 'bg-megasena/10 text-megasena border border-megasena/20',
                lotofacil: 'bg-lotofacil/10 text-lotofacil border border-lotofacil/20',
                quina: 'bg-quina/10 text-quina border border-quina/20',
                lotomania: 'bg-lotomania/10 text-lotomania border border-lotomania/20',
                timemania: 'bg-timemania/10 text-timemania border border-timemania/20',
                diadesorte: 'bg-diadesorte/10 text-diadesorte border border-diadesorte/20',
                default: 'bg-primary/10 text-primary border border-primary/20',
            },
            variant: {
                default: '',
                solid: '',
                outline: 'bg-transparent',
            },
        },
        compoundVariants: [
            {
                lottery: 'megasena',
                variant: 'solid',
                className: 'bg-megasena text-white border-0',
            },
            {
                lottery: 'lotofacil',
                variant: 'solid',
                className: 'bg-lotofacil text-white border-0',
            },
            {
                lottery: 'quina',
                variant: 'solid',
                className: 'bg-quina text-white border-0',
            },
        ],
        defaultVariants: {
            lottery: 'default',
            variant: 'default',
        },
    }
);

export interface LotteryBadgeProps extends VariantProps<typeof badgeVariants> {
    /** Nome da loteria */
    name: string;
    /** Ícone opcional */
    icon?: LucideIcon;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * LotteryBadge - Badge identificador de loteria
 * 
 * @example
 * <LotteryBadge name="Mega-Sena" lottery="megasena" />
 * 
 * @example
 * <LotteryBadge name="Lotofácil" lottery="lotofacil" variant="solid" icon={TrendingUp} />
 */
export const LotteryBadge = ({
    name,
    lottery,
    variant,
    icon: Icon,
    className,
}: LotteryBadgeProps) => {
    return (
        <span className={cn(badgeVariants({ lottery, variant }), className)}>
            {Icon && <Icon className="h-4 w-4" />}
            {name}
        </span>
    );
};

LotteryBadge.displayName = 'LotteryBadge';
