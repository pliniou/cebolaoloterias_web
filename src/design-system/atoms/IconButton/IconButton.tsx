/**
 * IconButton - Átomo para botões com ícone
 * Botão circular ou quadrado com apenas ícone
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const iconButtonVariants = cva(
    'inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-8 w-8',
                md: 'h-10 w-10',
                lg: 'h-12 w-12',
            },
            shape: {
                circle: 'rounded-full',
                square: 'rounded-md',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            shape: 'circle',
        },
    }
);

export interface IconButtonProps extends VariantProps<typeof iconButtonVariants> {
    /** Ícone a ser exibido */
    icon: LucideIcon;
    /** Label acessível (obrigatório) */
    'aria-label': string;
    /** Função ao clicar */
    onClick?: () => void;
    /** Desabilitado */
    disabled?: boolean;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * IconButton - Botão com ícone apenas
 * 
 * @example
 * import { Heart } from 'lucide-react';
 * <IconButton icon={Heart} aria-label="Favoritar" onClick={handleFavorite} />
 */
export const IconButton = ({
    icon: Icon,
    variant,
    size,
    shape,
    onClick,
    disabled,
    className,
    ...props
}: IconButtonProps) => {
    return (
        <button
            type="button"
            className={cn(iconButtonVariants({ variant, size, shape }), className)}
            onClick={onClick}
            disabled={disabled}
            aria-label={props['aria-label']}
        >
            <Icon className="h-4 w-4" />
        </button>
    );
};

IconButton.displayName = 'IconButton';
