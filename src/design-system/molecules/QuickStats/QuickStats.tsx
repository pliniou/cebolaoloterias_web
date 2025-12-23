/**
 * QuickStats - Molécula para estatísticas resumidas
 * Compõe múltiplos átomos para exibir métricas
 */

import { TrendingUp, Users, Calendar, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatItem {
    label: string;
    value: string | number;
    icon?: 'trending' | 'users' | 'calendar' | 'trophy';
    variant?: 'default' | 'primary' | 'accent';
}

export interface QuickStatsProps {
    /** Estatísticas a exibir */
    stats: StatItem[];
    /** Classe CSS adicional */
    className?: string;
}

const iconMap = {
    trending: TrendingUp,
    users: Users,
    calendar: Calendar,
    trophy: Trophy,
};

/**
 * QuickStats - Estatísticas resumidas em grid
 * 
 * @example
 * <QuickStats
 *   stats={[
 *     { label: 'Prêmio Estimado', value: 'R$ 50 milhões', icon: 'trophy' },
 *     { label: 'Ganhadores', value: 2, icon: 'users' },
 *   ]}
 * />
 */
export const QuickStats = ({ stats, className }: QuickStatsProps) => {
    return (
        <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
            {stats.map((stat, index) => {
                const Icon = stat.icon ? iconMap[stat.icon] : TrendingUp;

                return (
                    <div
                        key={index}
                        className="flex flex-col gap-2 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-azul-caixa" />
                            <span className="text-xs text-muted-foreground">{stat.label}</span>
                        </div>
                        <p className="text-lg font-bold">{stat.value}</p>
                    </div>
                );
            })}
        </div>
    );
};

QuickStats.displayName = 'QuickStats';
