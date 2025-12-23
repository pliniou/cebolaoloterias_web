/**
 * Generator Service
 * Serviço para geração de jogos
 */

import apiClient from '@/shared/api/apiClient';
import type { GeneratorRun, Preset, GenerateGamesRequest, CreatePresetRequest } from '@/shared/types/api';

export const generatorService = {
    /**
     * Gera jogos
     */
    async generate(payload: GenerateGamesRequest): Promise<GeneratorRun> {
        const { data } = await apiClient.post<GeneratorRun>('/generator/generate/', payload);
        return data;
    },

    /**
     * Lista presets do usuário
     */
    async listPresets(): Promise<Preset[]> {
        const { data } = await apiClient.get<Preset[]>('/generator/presets/');
        return data;
    },

    /**
     * Cria novo preset
     */
    async createPreset(payload: CreatePresetRequest): Promise<Preset> {
        const { data } = await apiClient.post<Preset>('/generator/presets/', payload);
        return data;
    },

    /**
     * Deleta preset
     */
    async deletePreset(id: number): Promise<void> {
        await apiClient.delete(`/generator/presets/${id}/`);
    },
};
