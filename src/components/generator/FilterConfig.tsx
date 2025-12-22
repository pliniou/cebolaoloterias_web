import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { LotteryInfo } from "@/lib/lotteries";
import { GeneratorRules } from "@/lib/generator-logic";
import { useEffect, useState } from "react";

interface FilterConfigProps {
    lottery: LotteryInfo;
    rules: GeneratorRules;
    onRulesChange: (rules: GeneratorRules) => void;
    lastResultNumbers?: number[];
}

export function FilterConfig({ lottery, rules, onRulesChange, lastResultNumbers }: FilterConfigProps) {
    // Local state for smoother sliders
    const [minSum, setMinSum] = useState(rules.sumRange?.[0] || 0);
    const [maxSum, setMaxSum] = useState(rules.sumRange?.[1] || 100);

    // Default sum range based on lottery roughly if not set
    // A normal distribution Bell curve peaks at (Min+Max)/2 * Count
    const averageSum = Math.floor((lottery.range[0] + lottery.range[1]) / 2 * lottery.numbers);
    // Let's set a reasonable default width around average
    const defaultMinSum = Math.floor(averageSum * 0.7);
    const defaultMaxSum = Math.floor(averageSum * 1.3);

    useEffect(() => {
        if (!rules.sumRange) {
            onRulesChange({ ...rules, sumRange: [defaultMinSum, defaultMaxSum] });
        }
    }, [lottery.slug]);

    const handleSumChange = (vals: number[]) => {
        setMinSum(vals[0]);
        setMaxSum(vals[1]);
        onRulesChange({ ...rules, sumRange: [vals[0], vals[1]] });
    };

    const handleEvenOddChange = (vals: number[]) => {
        onRulesChange({ ...rules, evenOddRatio: [vals[0], vals[1]] });
    };

    const handleConsecutiveChange = (val: number[]) => {
        onRulesChange({ ...rules, maxConsecutive: val[0] });
    };

    const handleRepeatedChange = (val: number[]) => {
        onRulesChange({ ...rules, maxRepeated: val[0], testAgainstNumbers: lastResultNumbers });
    };

    // Calculate max possible sum for slider boundaries
    const maxPossibleSum = lottery.range[1] * lottery.numbers; // Rough upper bound
    const minPossibleSum = 1 * lottery.numbers;

    return (
        <Card>
            <CardContent className="pt-6 space-y-8">

                {/* Sum Range */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base">Intervalo de Soma</Label>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {rules.sumRange?.[0] ?? defaultMinSum} - {rules.sumRange?.[1] ?? defaultMaxSum}
                        </span>
                    </div>
                    <Slider
                        defaultValue={[defaultMinSum, defaultMaxSum]}
                        value={[rules.sumRange?.[0] ?? defaultMinSum, rules.sumRange?.[1] ?? defaultMaxSum]}
                        min={minPossibleSum}
                        max={maxPossibleSum}
                        step={5}
                        onValueChange={handleSumChange}
                        className="py-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        A soma de todos os números do jogo. Jogos reais tendem a ficar próximos da média ({averageSum}).
                    </p>
                </div>

                {/* Even/Odd */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base">Mínimo/Máximo de Pares</Label>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {rules.evenOddRatio?.[0] ?? 0} a {rules.evenOddRatio?.[1] ?? lottery.numbers} Pares
                        </span>
                    </div>
                    {/* 
                      Slider for Even count. 
                      Min 0, Max = lottery.numbers. 
                      Two thumbs for range (e.g. between 2 and 4 evens).
                    */}
                    <Slider
                        defaultValue={[0, lottery.numbers]}
                        value={rules.evenOddRatio || [0, lottery.numbers]}
                        min={0}
                        max={lottery.numbers}
                        step={1}
                        onValueChange={handleEvenOddChange}
                        className="py-2"
                    />
                    <p className="text-xs text-muted-foreground">
                        Defina quantos números pares devem aparecer no jogo.
                    </p>
                </div>

                {/* Consecutive */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Label className="text-base">Sequência Máxima</Label>
                        <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                            {rules.maxConsecutive ?? lottery.numbers} números
                        </span>
                    </div>
                    <Slider
                        defaultValue={[lottery.numbers]}
                        value={[rules.maxConsecutive ?? lottery.numbers]}
                        min={1}
                        max={lottery.numbers}
                        step={1}
                        onValueChange={handleConsecutiveChange}
                    />
                    <p className="text-xs text-muted-foreground">
                        Exemplo: Sequência de 2 permitida (01, 02). Sequência de 3 (01, 02, 03) bloqueada.
                    </p>
                </div>

                {/* Repeated from Last Contest */}
                {lastResultNumbers && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-base">Repetidos do Último Concurso</Label>
                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                                Max: {rules.maxRepeated ?? lottery.numbers}
                            </span>
                        </div>
                        <Slider
                            defaultValue={[lottery.numbers]}
                            value={[rules.maxRepeated ?? lottery.numbers]}
                            min={0}
                            max={lottery.numbers}
                            step={1}
                            onValueChange={handleRepeatedChange}
                        />
                        <p className="text-xs text-muted-foreground">
                            Evite repetir muitos números do sorteio anterior.
                        </p>
                    </div>
                )}

            </CardContent>
        </Card>
    );
}
