/**
 * React Query hooks para Tickets
 */

import { useQuery, useMutation, useQueryClient, UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { ticketService } from '../services/ticketService';
import type { UserTicket, CreateTicketRequest, TicketCheckResult, PaginatedResponse } from '@/shared/types/api';

/**
 * Hook para listar tickets do usuário
 */
export const useTickets = (page = 1): UseQueryResult<PaginatedResponse<UserTicket>, Error> => {
    return useQuery({
        queryKey: ['tickets', page],
        queryFn: () => ticketService.list(page),
        staleTime: 30 * 1000, // 30 segundos
        keepPreviousData: true,
    });
};

/**
 * Hook para buscar ticket por ID
 */
export const useTicket = (id: number): UseQueryResult<UserTicket, Error> => {
    return useQuery({
        queryKey: ['ticket', id],
        queryFn: () => ticketService.getById(id),
        enabled: !!id,
    });
};

/**
 * Hook para criar ticket
 */
export const useCreateTicket = (): UseMutationResult<UserTicket, Error, CreateTicketRequest> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ticketService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

/**
 * Hook para atualizar ticket
 */
export const useUpdateTicket = (): UseMutationResult<UserTicket, Error, { id: number; data: Partial<CreateTicketRequest> }> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => ticketService.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['ticket', variables.id] });
        },
    });
};

/**
 * Hook para deletar ticket
 */
export const useDeleteTicket = (): UseMutationResult<void, Error, number> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ticketService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

/**
 * Hook para conferir ticket
 */
export const useCheckTicket = (): UseMutationResult<TicketCheckResult, Error, { ticketId: number; drawId: number }> => {
    return useMutation({
        mutationFn: ({ ticketId, drawId }) => ticketService.check(ticketId, { draw_id: drawId }),
    });
};
