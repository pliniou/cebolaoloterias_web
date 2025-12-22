import { GeneratorRules } from "./generator-logic";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export interface GeneratorPreset {
    id: string;
    name: string;
    lotterySlug: string; // Presets are often lottery-specific due to Sum/Range differences
    rules: GeneratorRules;
}

const STORAGE_KEY = "cebolao_generator_presets";

export const defaultPresets: GeneratorPreset[] = [
    {
        id: "balanced-mega",
        name: "Mega-Sena Equilibrada",
        lotterySlug: "megasena",
        rules: {
            sumRange: [150, 220],
            evenOddRatio: [2, 4], // 2 to 4 evens (Accepts 2e/4o, 3e/3o, 4e/2o)
            maxConsecutive: 2
        }
    },
    {
        id: "odd-heavy-loto",
        name: "Lotofácil - Mais Ímpares",
        lotterySlug: "lotofacil",
        rules: {
            evenOddRatio: [6, 7], // 6 or 7 evens (meaning 9 or 8 odds, which is statistically common)
            sumRange: [180, 210]
        }
    }
];

export function useGeneratorPresets() {
    const [presets, setPresets] = useState<GeneratorPreset[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setPresets(JSON.parse(stored));
            } catch {
                setPresets([]);
            }
        } else {
            // Load defaults if empty? Or just keep them separate?
            // Let's mix them or provide them as "System Presets" vs "User Presets"
            // For simplicity, let's just use local saved ones. Defaults are available to copy.
        }
    }, []);

    const savePreset = (name: string, lotterySlug: string, rules: GeneratorRules) => {
        const newPreset: GeneratorPreset = {
            id: crypto.randomUUID(),
            name,
            lotterySlug,
            rules
        };
        const updated = [...presets, newPreset];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setPresets(updated);
        toast.success("Preset salvo!");
    };

    const deletePreset = (id: string) => {
        const updated = presets.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setPresets(updated);
        toast.success("Preset removido.");
    };

    return {
        presets,
        savePreset,
        deletePreset,
        allPresets: [...defaultPresets, ...presets]
    };
}
