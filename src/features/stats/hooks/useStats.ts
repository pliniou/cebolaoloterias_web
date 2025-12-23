/**
 * React Query hooks para Stats
 */

import { useQuery } from '@tanstack/react-query';
import { statsService } from '../services/statsService';
import type { DrawStatistics } from '@/shared/types/api';

export const useDrawStats = (drawId: number) => {
    return useQuery({
        queryKey: ['draw-stats', drawId],
        queryFn: () => statsService.getDrawStats(drawId),
        enabled: !!drawId,
        staleTime: 60 * 60 * 1000, // 1 hora (estatísticas não mudam)
    });
};

export const useLotteryStats = (lotterySlug: string) => {
    return useQuery({
        queryKey: ['lottery-stats', lotterySlug],
        queryFn: () => statsService.getLotteryStats(lotterySlug),
        enabled: !!lotterySlug,
        staleTime: 10 * 60 * 1000, // 10 minutos
    });
};
