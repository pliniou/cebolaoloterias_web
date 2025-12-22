import { useState, useEffect } from "react";
import { lotteries } from "@/lib/lotteries";
import { GeneratorRules, generateBatch, getGameStatsWithComparison } from "@/lib/generator-logic";
import { useGeneratorPresets } from "@/lib/presets";
import { useSavedGames } from "@/lib/saved-games";
import { generateMockResult } from "@/lib/lottery-types";
import { FilterConfig } from "@/components/generator/FilterConfig";
import { GeneratedGameCard } from "@/components/generator/GeneratedGameCard";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Wand2, Save } from "lucide-react";

export function Generator() {
    const [selectedLotterySlug, setSelectedLotterySlug] = useState<string>(lotteries[0].slug);
    const [rules, setRules] = useState<GeneratorRules>({});

    // Generation State
    const [generatedGames, setGeneratedGames] = useState<number[][]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [quantity, setQuantity] = useState(5);

    // Last Result for comparison
    const [lastResultNumbers, setLastResultNumbers] = useState<number[]>([]);

    // Preset State
    const { allPresets, savePreset } = useGeneratorPresets();
    const [presetName, setPresetName] = useState("");
    const [selectedPresetId, setSelectedPresetId] = useState<string>("custom");

    const { addGame } = useSavedGames();

    const selectedLottery = lotteries.find(l => l.slug === selectedLotterySlug)!;

    // Reset rules when lottery changes
    useEffect(() => {
        setRules({});
        setGeneratedGames([]);
        setSelectedPresetId("custom");

        // Mock fetch last result
        const result = generateMockResult(selectedLotterySlug, 2800, selectedLottery.numbers, selectedLottery.range);
        setLastResultNumbers(result.numbers);

    }, [selectedLotterySlug, selectedLottery.numbers, selectedLottery.range]);

    const handleGenerate = () => {
        setIsGenerating(true);
        // Use timeout to allow UI update
        setTimeout(() => {
            const games = generateBatch(selectedLottery, rules, quantity);
            setGeneratedGames(games);
            setIsGenerating(false);
            if (games.length < quantity) {
                toast.warning(`Geramos apenas ${games.length} jogos. Filtros muito restritivos?`);
            } else {
                toast.success(`${games.length} jogos gerados!`);
            }
        }, 500);
    };

    const handleApplyPreset = (presetId: string) => {
        setSelectedPresetId(presetId);
        if (presetId === "custom") {
            return;
        }
        const preset = allPresets.find(p => p.id === presetId);
        if (preset) {
            // If preset is for another lottery, warn or switch? 
            // Ideally switch lottery too if meaningful, but for now let's just warn if mismatch
            if (preset.lotterySlug !== selectedLotterySlug) {
                toast.error(`Este preset é para ${preset.lotterySlug}. Mude a loteria primeiro.`);
                setSelectedPresetId("custom");
                return;
            }
            setRules({ ...preset.rules });
        }
    };

    const handleSavePreset = () => {
        if (!presetName.trim()) {
            toast.error("Dê um nome ao preset.");
            return;
        }
        savePreset(presetName, selectedLotterySlug, rules);
        setPresetName("");
    };

    const handleSaveGame = (numbers: number[]) => {
        addGame({
            lotterySlug: selectedLotterySlug,
            numbers,
            tags: ["Gerador"],
            name: `Gerado em ${new Date().toLocaleDateString()}`
        });
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-6xl">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Wand2 className="h-8 w-8 text-primary" />
                        Gerador Inteligente
                    </h1>
                    <p className="text-muted-foreground">
                        Crie jogos com base em estatísticas e regras personalizadas.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sidebar / Configuration */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuração</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Loteria</label>
                                <Select
                                    value={selectedLotterySlug}
                                    onValueChange={setSelectedLotterySlug}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {lotteries.map((l) => (
                                            <SelectItem key={l.slug} value={l.slug}>
                                                {l.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Preset</label>
                                <Select
                                    value={selectedPresetId}
                                    onValueChange={handleApplyPreset}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="custom">Personalizado</SelectItem>
                                        {allPresets.filter(p => p.lotterySlug === selectedLotterySlug).map((p) => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <FilterConfig
                        lottery={selectedLottery}
                        rules={rules}
                        onRulesChange={(newRules) => {
                            setRules(newRules);
                            setSelectedPresetId("custom");
                        }}
                        lastResultNumbers={lastResultNumbers}
                    />

                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nome do novo preset"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                />
                                <Button variant="outline" size="icon" onClick={handleSavePreset}>
                                    <Save className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-muted p-4 rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Quantidade de Jogos</label>
                            <span className="font-bold">{quantity}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            className="w-full accent-primary"
                        />
                        <Button className="w-full" size="lg" onClick={handleGenerate} disabled={isGenerating}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Gerar Jogos
                        </Button>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-8">
                    <h2 className="text-xl font-bold mb-4">Jogos Gerados ({generatedGames.length})</h2>
                    {generatedGames.length === 0 ? (
                        <div className="h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-muted/20">
                            <Wand2 className="h-12 w-12 mb-4 opacity-20" />
                            <p>Configure os filtros e clique em gerar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            {generatedGames.map((game, idx) => (
                                <GeneratedGameCard
                                    key={idx}
                                    numbers={game}
                                    lottery={selectedLottery}
                                    onSave={() => handleSaveGame(game)}
                                    comparisonNumbers={lastResultNumbers}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
