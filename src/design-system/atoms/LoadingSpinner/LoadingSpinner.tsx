/**
 * LoadingSpinner - Átomo para estados de carregamento
 * Spinner com cores CAIXA
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const spinnerVariants = cva(
    'animate-spin',
    {
        variants: {
            size: {
                sm: 'h-4 w-4',
                md: 'h-8 w-8',
                lg: 'h-12 w-12',
                xl: 'h-16 w-16',
            },
            variant: {
                primary: 'text-azul-caixa',
                accent: 'text-laranja-caixa',
                muted: 'text-muted-foreground',
                current: 'text-current',
            },
        },
        defaultVariants: {
            size: 'md',
            variant: 'primary',
        },
    }
);

export interface LoadingSpinnerProps extends VariantProps<typeof spinnerVariants> {
    /** Label acessível */
    label?: string;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * LoadingSpinner - Indicador de carregamento
 * 
 * @example
 * <LoadingSpinner size="lg" variant="primary" label="Carregando loterias..." />
 */
export const LoadingSpinner = ({
    size,
    variant,
    label = 'Carregando...',
    className,
}: LoadingSpinnerProps) => {
    return (
        <Loader2
            className={cn(spinnerVariants({ size, variant }), className)}
            role="status"
            aria-label={label}
        />
    );
};

LoadingSpinner.displayName = 'LoadingSpinner';
