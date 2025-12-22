import { LotteryInfo } from "./lotteries";

export interface GeneratorRules {
    evenOddRatio?: [number, number]; // e.g. [3, 3] for 6 numbers
    sumRange?: [number, number];
    maxConsecutive?: number;
    includeNumbers?: number[];
    excludeNumbers?: number[];
    maxRepeated?: number;
    testAgainstNumbers?: number[]; // Numbers to check repetition against (e.g. last contest)
}

export interface GameStats {
    sum: number;
    evenCount: number;
    oddCount: number;
    consecutiveMax: number;
    rangeDiff: number;
    repeatedCount: number;
}

export function getGameStats(numbers: number[]): GameStats {
    const sorted = [...numbers].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);
    const evenCount = sorted.filter((n) => n % 2 === 0).length;
    const oddCount = sorted.length - evenCount;

    let maxConsecutive = 1;
    let currentConsecutive = 1;
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
            currentConsecutive++;
        } else {
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
            currentConsecutive = 1;
        }
    }
    maxConsecutive = Math.max(maxConsecutive, currentConsecutive);

    // Calculate repeated if comparison numbers exist in context (not passed here directly usually, but let's assume we handle it or just return 0 if not needed for stats unless passed)
    // Actually getGameStats signatures doesn't have the comparison numbers. 
    // Let's rely on validateGame for the check, but for displaying "Repeated: X" on the card, we might need it.
    // For now, let's just return 0 in stats unless we change signature. 
    // Actually, let's keep it simple. Validate checks it. Stats might not need to show it unless we pass the reference.
    // Let's update signature to optional match against.

    return {
        sum,
        evenCount,
        oddCount,
        consecutiveMax: maxConsecutive,
        rangeDiff: sorted[sorted.length - 1] - sorted[0],
        repeatedCount: 0 // Placeholder, updated in UI if needed or we change signature
    };
}

export function getGameStatsWithComparison(numbers: number[], compareTo?: number[]): GameStats {
    const stats = getGameStats(numbers);
    if (compareTo) {
        stats.repeatedCount = numbers.filter(n => compareTo.includes(n)).length;
    }
    return stats;
}

// Simple rejection sampling
export function generateGame(lottery: LotteryInfo, rules: GeneratorRules): number[] | null {
    let attempts = 0;
    const maxAttempts = 2000; // Prevent infinite loops

    while (attempts < maxAttempts) {
        attempts++;
        const candidate = generateRandomNumbers(lottery, rules.includeNumbers, rules.excludeNumbers);
        if (validateGame(candidate, rules)) {
            return candidate.sort((a, b) => a - b);
        }
    }

    return null; // Failed to generate within limits
}

function generateRandomNumbers(
    lottery: LotteryInfo,
    forced: number[] = [],
    excluded: number[] = []
): number[] {
    const numbers = new Set<number>(forced);
    const [min, max] = lottery.range;
    const count = lottery.numbers;

    while (numbers.size < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!excluded.includes(num)) {
            numbers.add(num);
        }
    }

    return Array.from(numbers);
}

function validateGame(numbers: number[], rules: GeneratorRules): boolean {
    const stats = getGameStats(numbers);

    // Validate Sum
    if (rules.sumRange) {
        const [minSum, maxSum] = rules.sumRange;
        if (stats.sum < minSum || stats.sum > maxSum) return false;
    }

    // Validate Even/Odd Ratio
    // We usually check if it matches EXACTLY or within range.
    // Let's assume the rules specify exact target count of Evens or a range allowed?
    // Usually users say "3 pairs", meaning exactly 3 even numbers. 
    // But strictly forcing it can be hard. Let's support an array of allowed even counts?
    // To keep it simple based on the interface `[minEven, maxEven]`. 
    // If user wants exactly 3, passed [3,3].
    if (rules.evenOddRatio) {
        const [minEven, maxEven] = rules.evenOddRatio;
        if (stats.evenCount < minEven || stats.evenCount > maxEven) return false;
    }

    // Validate Consecutive
    if (rules.maxConsecutive !== undefined) {
        if (stats.consecutiveMax > rules.maxConsecutive) return false;
    }

    // Validate Repeated
    if (rules.maxRepeated !== undefined && rules.testAgainstNumbers) {
        const repeated = numbers.filter(n => rules.testAgainstNumbers!.includes(n)).length;
        if (repeated > rules.maxRepeated) return false;
    }

    return true;
}

export function generateBatch(
    lottery: LotteryInfo,
    rules: GeneratorRules,
    quantity: number
): number[][] {
    const results: number[][] = [];
    for (let i = 0; i < quantity; i++) {
        const game = generateGame(lottery, rules);
        if (game) results.push(game);
    }
    return results;
}
