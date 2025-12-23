/**
 * Lottery Service
 * Serviço para consumir endpoints de loterias do backend Django
 */

import apiClient from '@/shared/api/apiClient';
import type { Lottery, Draw, PaginatedResponse } from '@/shared/types/api';

export interface GetDrawsParams {
    page?: number;
    page_size?: number;
    start_date?: string;
    end_date?: string;
}

export const lotteryService = {
    /**
     * Lista todas as loterias ativas
     */
    async getAll(): Promise<Lottery[]> {
        const { data } = await apiClient.get<Lottery[]>('/lotteries/');
        return data;
    },

    /**
     * Busca loteria por slug
     */
    async getBySlug(slug: string): Promise<Lottery> {
        const { data } = await apiClient.get<Lottery>(`/lotteries/${slug}/`);
        return data;
    },

    /**
     * Busca histórico de sorteios de uma loteria (paginado)
     */
    async getDraws(
        slug: string,
        params: GetDrawsParams = {}
    ): Promise<PaginatedResponse<Draw>> {
        const { data } = await apiClient.get<PaginatedResponse<Draw>>(
            `/lotteries/${slug}/draws/`,
            { params }
        );
        return data;
    },

    /**
     * Busca sorteio específico por número de concurso
     */
    async getDrawByNumber(slug: string, contestNumber: number): Promise<Draw> {
        const { data } = await apiClient.get<Draw>(
            `/lotteries/${slug}/draws/${contestNumber}/`
        );
        return data;
    },

    /**
     * Busca o sorteio mais recente de uma loteria
     */
    async getLatestDraw(slug: string): Promise<Draw> {
        const { data } = await apiClient.get<Draw>(
            `/lotteries/${slug}/draws/latest/`
        );
        return data;
    },
};
