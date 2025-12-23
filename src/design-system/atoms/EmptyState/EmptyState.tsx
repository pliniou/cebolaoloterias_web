/**
 * EmptyState - Átomo para estados vazios
 * Mensagem quando não há dados para exibir
 */

import { cn } from '@/lib/utils';
import { Inbox, type LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
    /** Ícone customizado */
    icon?: LucideIcon;
    /** Título da mensagem */
    title: string;
    /** Descrição opcional */
    description?: string;
    /** Classe CSS adicional */
    className?: string;
}

/**
 * EmptyState - Estado vazio
 * 
 * @example
 * <EmptyState
 *   title="Nenhum sorteio encontrado"
 *   description="Não há sorteios disponíveis para esta loteria."
 * />
 */
export const EmptyState = ({
    icon: Icon = Inbox,
    title,
    description,
    className,
}: EmptyStateProps) => {
    return (
        <div className={cn('flex flex-col items-center justify-center p-8 text-center', className)}>
            <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
            )}
        </div>
    );
};

EmptyState.displayName = 'EmptyState';
