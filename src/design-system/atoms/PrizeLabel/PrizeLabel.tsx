/**
 * PrizeLabel - Átomo para exibição de valores monetários
 * Formatado em Real (BRL) com cores CAIXA
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';

const prizeLabelVariants = cva(
    'inline-flex items-center gap-2 font-bold',
    {
        variants: {
            size: {
                sm: 'text-sm',
                md: 'text-base',
                lg: 'text-lg',
                xl: 'text-2xl',
            },
            variant: {
                default: 'text-foreground',
                primary: 'text-azul-caixa',
                accent: 'text-laranja-caixa',
                success: 'text-green-600',
                muted: 'text-muted-foreground',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'default',
        },
    }
);

export interface PrizeLabelProps extends VariantProps<typeof prizeLabelVariants> {
    /** Valor em centavos ou reais */
    value: number;
    /** Mostrar ícone de trending */
    showIcon?: boolean;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * PrizeLabel - Exibe valores em Real brasileiro
 * 
 * @example
 * <PrizeLabel value={50000000} size="xl" variant="accent" showIcon />
 */
export const PrizeLabel = ({
    value,
    size,
    variant,
    showIcon = false,
    className,
}: PrizeLabelProps) => {
    const formatted = value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
    });

    return (
        <span className={cn(prizeLabelVariants({ size, variant }), className)}>
            {showIcon && <TrendingUp className="h-4 w-4" />}
            {formatted}
        </span>
    );
};

PrizeLabel.displayName = 'PrizeLabel';
