/**
 * StatusBadge - Átomo para status de sorteios
 * Badges para estados como acumulado, vencedor, etc
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';

const statusBadgeVariants = cva(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
    {
        variants: {
            status: {
                accumulated: 'bg-laranja-caixa/10 text-laranja-caixa border border-laranja-caixa/20',
                winner: 'bg-green-500/10 text-green-600 border border-green-500/20',
                pending: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
                info: 'bg-azul-caixa/10 text-azul-caixa border border-azul-caixa/20',
            },
        },
        defaultVariants: {
            status: 'info',
        },
    }
)

    ;

const iconMap = {
    accumulated: TrendingUp,
    winner: CheckCircle,
    pending: Clock,
    info: AlertCircle,
};

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
    /** Texto do badge */
    text: string;
    /** Mostrar ícone */
    showIcon?: boolean;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * StatusBadge - Badge de status
 * 
 * @example
 * <StatusBadge status="accumulated" text="ACUMULOU!" showIcon />
 * <StatusBadge status="winner" text="Ganhador" showIcon />
 */
export const StatusBadge = ({
    status = 'info',
    text,
    showIcon = true,
    className,
}: StatusBadgeProps) => {
    const Icon = iconMap[status!];

    return (
        <span className={cn(statusBadgeVariants({ status }), className)}>
            {showIcon && <Icon className="h-3 w-3" />}
            {text}
        </span>
    );
};

StatusBadge.displayName = 'StatusBadge';
