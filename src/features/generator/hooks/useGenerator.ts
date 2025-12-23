/**
 * React Query hooks para Generator
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { generatorService } from '../services/generatorService';
import type { Preset, GenerateGamesRequest, CreatePresetRequest, GeneratorRun } from '@/shared/types/api';

export const useGenerateGames = () => {
    return useMutation({
        mutationFn: (payload: GenerateGamesRequest) => generatorService.generate(payload),
    });
};

export const usePresets = () => {
    return useQuery({
        queryKey: ['presets'],
        queryFn: () => generatorService.listPresets(),
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
};

export const useCreatePreset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreatePresetRequest) => generatorService.createPreset(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presets'] });
        },
    });
};

export const useDeletePreset = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => generatorService.deletePreset(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['presets'] });
        },
    });
};
