/**
 * Utility functions for lottery data formatting
 */

/**
 * Formata valor em reais
 */
export function formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

/**
 * Formata data ISO para pt-BR
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

/**
 * Gera números aleatórios para preview
 * @deprecated Use dados reais da API
 */
export function generateRandomNumbers(count: number, min: number, max: number): number[] {
    const numbers = new Set<number>();

    while (numbers.size < count) {
        const num = Math.floor(Math.random() * (max - min + 1)) + min;
        numbers.add(num);
    }

    return Array.from(numbers).sort((a, b) => a - b);
}
