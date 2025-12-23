/**
 * Tests for LoadingSpinner atom
 */

import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
    it('renders with default props', () => {
        const { container } = render(<LoadingSpinner />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('has animate-spin class', () => {
        const { container } = render(<LoadingSpinner />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('animate-spin');
    });

    it('applies correct size classes', () => {
        const { container } = render(<LoadingSpinner size="lg" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('h-12', 'w-12');
    });

    it('applies primary color by default', () => {
        const { container } = render(<LoadingSpinner />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('text-azul-caixa');
    });

    it('applies accent color variant', () => {
        const { container } = render(<LoadingSpinner variant="accent" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveClass('text-laranja-caixa');
    });

    it('has accessible label', () => {
        const { container } = render(<LoadingSpinner label="Carregando dados..." />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-label', 'Carregando dados...');
    });

    it('has default label', () => {
        const { container } = render(<LoadingSpinner />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('aria-label', 'Carregando...');
    });
});
