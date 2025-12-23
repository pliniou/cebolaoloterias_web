/**
 * Tests for StatusBadge atom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
    it('renders text correctly', () => {
        render(<StatusBadge text="ACUMULOU!" status="accumulated" />);
        expect(screen.getByText('ACUMULOU!')).toBeInTheDocument();
    });

    it('renders icon by default', () => {
        const { container } = render(<StatusBadge text="Test" status="winner" />);
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
    });

    it('hides icon when showIcon is false', () => {
        const { container } = render(<StatusBadge text="Test" status="winner" showIcon={false} />);
        const svg = container.querySelector('svg');
        expect(svg).not.toBeInTheDocument();
    });

    it('applies accumulated status classes', () => {
        const { container } = render(<StatusBadge text="Acumulado" status="accumulated" />);
        expect(container.firstChild).toHaveClass('text-laranja-caixa');
    });

    it('applies winner status classes', () => {
        const { container } = render(<StatusBadge text="Ganhador" status="winner" />);
        expect(container.firstChild).toHaveClass('text-green-600');
    });

    it('applies pending status classes', () => {
        const { container } = render(<StatusBadge text="Pendente" status="pending" />);
        expect(container.firstChild).toHaveClass('text-yellow-600');
    });
});
