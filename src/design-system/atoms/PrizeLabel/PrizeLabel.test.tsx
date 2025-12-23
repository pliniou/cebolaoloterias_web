/**
 * Tests for PrizeLabel atom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PrizeLabel } from './PrizeLabel';

describe('PrizeLabel', () => {
    it('formats value as BRL currency', () => {
        render(<PrizeLabel value={50000000} />);
        expect(screen.getByText('R$ 50.000.000,00')).toBeInTheDocument();
    });

    it('formats small values correctly', () => {
        render(<PrizeLabel value={1500.50} />);
        expect(screen.getByText('R$ 1.500,50')).toBeInTheDocument();
    });

    it('shows icon when showIcon is true', () => {
        const { container } = render(<PrizeLabel value={1000} showIcon />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('does not show icon by default', () => {
        const { container } = render(<PrizeLabel value={1000} />);
        const svg = container.querySelector('svg');
        expect(svg).not.toBeInTheDocument();
    });

    it('applies size variant classes', () => {
        const { container } = render(<PrizeLabel value={1000} size="xl" />);
        expect(container.firstChild).toHaveClass('text-2xl');
    });

    it('applies color variant classes', () => {
        const { container } = render(<PrizeLabel value={1000} variant="accent" />);
        expect(container.firstChild).toHaveClass('text-laranja-caixa');
    });
});
