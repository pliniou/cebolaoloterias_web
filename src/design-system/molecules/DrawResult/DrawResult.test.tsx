/**
 * Tests for DrawResult molecule
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DrawResult } from './DrawResult';

describe('DrawResult', () => {
    const mockProps = {
        lotterySlug: 'megasena',
        lotteryName: 'Mega-Sena',
        drawNumber: 2789,
        drawDate: '2025-12-23',
        numbers: [5, 12, 23, 34, 45, 58],
    };

    it('renders lottery name', () => {
        render(<DrawResult {...mockProps} />);
        expect(screen.getByText('Mega-Sena')).toBeInTheDocument();
    });

    it('renders draw number', () => {
        render(<DrawResult {...mockProps} />);
        expect(screen.getByText(/Concurso 2789/)).toBeInTheDocument();
    });

    it('renders all numbers', () => {
        render(<DrawResult {...mockProps} />);
        mockProps.numbers.forEach(num => {
            const formatted = num.toString().padStart(2, '0');
            expect(screen.getByText(formatted)).toBeInTheDocument();
        });
    });

    it('renders correct number of balls', () => {
        const { container } = render(<DrawResult {...mockProps} />);
        const balls = container.querySelectorAll('[role="img"]');
        expect(balls).toHaveLength(6);
    });
});
