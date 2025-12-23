/**
 * Centralized utility functions for Cebolão Loterias
 */

/**
 * Generates a set of unique random numbers for a lottery draw
 */
export function generateRandomNumbers(count: number, min: number, max: number): number[] {
    const numbers: number[] = [];
    const rangeSize = max - min + 1;
    const actualCount = Math.min(count, rangeSize);

    while (numbers.length < actualCount) {
        const num = Math.floor(Math.random() * rangeSize) + min;
        if (!numbers.includes(num)) {
            numbers.push(num);
        }
    }
    return numbers.sort((a, b) => a - b);
}

/**
 * Formats a currency value to BRL
 */
export function formatCurrency(value: number): string {
    return value.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

/**
 * Formats an ISO date string to pt-BR format
 */
export function formatDate(dateString: string): string {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch (e) {
        return dateString;
    }
}
