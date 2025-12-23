/**
 * Stats Service  
 * Serviço para estatísticas de sorteios
 */

import apiClient from '@/shared/api/apiClient';
import type { DrawStatistics } from '@/shared/types/api';

export const statsService = {
    /**
     * Busca estatísticas de um sorteio
     */
    async getDrawStats(drawId: number): Promise<DrawStatistics> {
        const { data } = await apiClient.get<DrawStatistics>(`/stats/draws/${drawId}/`);
        return data;
    },

    /**
     * Busca estatísticas de uma loteria
     */
    async getLotteryStats(lotterySlug: string): Promise<DrawStatistics[]> {
        const { data } = await apiClient.get<DrawStatistics[]>(`/stats/lotteries/${lotterySlug}/`);
        return data;
    },
};
