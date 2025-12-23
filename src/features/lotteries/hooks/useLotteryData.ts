/**
 * React Query Hooks para Loterias
 * Gerencia cache, loading states e refetch de dados de loterias
 */

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { lotteryService, GetDrawsParams } from '../services/lotteryService';
import type { Lottery, Draw, PaginatedResponse } from '@/shared/types/api';

/**
 * Hook para buscar todas as loterias
 * Cache: 1 hora (dados mudam raramente)
 */
export const useLotteries = (): UseQueryResult<Lottery[], Error> => {
    return useQuery({
        queryKey: ['lotteries'],
        queryFn: () => lotteryService.getAll(),
        staleTime: 60 * 60 * 1000, // 1 hora
        cacheTime: 24 * 60 * 60 * 1000, // 24 horas
        retry: 2,
    });
};

/**
 * Hook para buscar loteria específica por slug
 * Cache: 1 hora
 */
export const useLottery = (
    slug: string
): UseQueryResult<Lottery, Error> => {
    return useQuery({
        queryKey: ['lottery', slug],
        queryFn: () => lotteryService.getBySlug(slug),
        enabled: !!slug, // Só executa se slug existir
        staleTime: 60 * 60 * 1000,
        cacheTime: 24 * 60 * 60 * 1000,
        retry: 2,
    });
};

/**
 * Hook para buscar histórico de sorteios (paginado)
 * Cache: 5 minutos (dados mudam com frequência)
 */
export const useLotteryDraws = (
    slug: string,
    params: GetDrawsParams = {}
): UseQueryResult<PaginatedResponse<Draw>, Error> => {
    return useQuery({
        queryKey: ['lottery-draws', slug, params],
        queryFn: () => lotteryService.getDraws(slug, params),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000, // 5 minutos
        cacheTime: 30 * 60 * 1000, // 30 minutos
        keepPreviousData: true, // Mantém dados anteriores durante paginação
        retry: 2,
    });
};

/**
 * Hook para buscar o último sorteio de uma loteria
 * Cache: 2 minutos (atualiza frequentemente)
 * Refetch automático a cada 5 minutos
 */
export const useLatestDraw = (
    slug: string
): UseQueryResult<Draw, Error> => {
    return useQuery({
        queryKey: ['lottery-latest-draw', slug],
        queryFn: () => lotteryService.getLatestDraw(slug),
        enabled: !!slug,
        staleTime: 2 * 60 * 1000, // 2 minutos
        cacheTime: 10 * 60 * 1000, // 10 minutos
        refetchInterval: 5 * 60 * 1000, // Refetch automático a cada 5 min
        retry: 2,
    });
};

/**
 * Hook para buscar sorteio específico por número
 * Cache: 1 hora (sorteios passados não mudam)
 */
export const useDrawByNumber = (
    slug: string,
    contestNumber: number
): UseQueryResult<Draw, Error> => {
    return useQuery({
        queryKey: ['draw', slug, contestNumber],
        queryFn: () => lotteryService.getDrawByNumber(slug, contestNumber),
        enabled: !!slug && !!contestNumber,
        staleTime: 60 * 60 * 1000, // 1 hora
        cacheTime: 24 * 60 * 60 * 1000, // 24 horas
        retry: 2,
    });
};
