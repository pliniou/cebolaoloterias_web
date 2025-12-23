/**
 * Ticket Service
 * Serviço para gerenciar apostas do usuário
 */

import apiClient from '@/shared/api/apiClient';
import type {
    UserTicket,
    CreateTicketRequest,
    TicketCheckResult,
    CheckTicketRequest,
    PaginatedResponse,
} from '@/shared/types/api';

export const ticketService = {
    /**
     * Lista tickets do usuário
     */
    async list(page = 1): Promise<PaginatedResponse<UserTicket>> {
        const { data } = await apiClient.get<PaginatedResponse<UserTicket>>('/tickets/', {
            params: { page },
        });
        return data;
    },

    /**
     * Busca ticket por ID
     */
    async getById(id: number): Promise<UserTicket> {
        const { data } = await apiClient.get<UserTicket>(`/tickets/${id}/`);
        return data;
    },

    /**
     * Cria novo ticket
     */
    async create(payload: CreateTicketRequest): Promise<UserTicket> {
        const { data } = await apiClient.post<UserTicket>('/tickets/', payload);
        return data;
    },

    /**
     * Atualiza ticket existente
     */
    async update(id: number, payload: Partial<CreateTicketRequest>): Promise<UserTicket> {
        const { data } = await apiClient.patch<UserTicket>(`/tickets/${id}/`, payload);
        return data;
    },

    /**
     * Deleta ticket
     */
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/tickets/${id}/`);
    },

    /**
     * Confere ticket contra sorteio
     */
    async check(ticketId: number, payload: CheckTicketRequest): Promise<TicketCheckResult> {
        const { data } = await apiClient.post<TicketCheckResult>(
            `/tickets/${ticketId}/check/`,
            payload
        );
        return data;
    },
};
