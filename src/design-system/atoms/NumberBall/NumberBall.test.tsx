/**
 * Tests for NumberBall atom
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NumberBall } from './NumberBall';

describe('NumberBall', () => {
    it('renders number with zero padding', () => {
        render(<NumberBall number={5} />);
        expect(screen.getByText('05')).toBeInTheDocument();
    });

    it('renders number without padding for two digits', () => {
        render(<NumberBall number={42} />);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('applies correct lottery color class', () => {
        const { container } = render(<NumberBall number={10} lottery="megasena" />);
        expect(container.firstChild).toHaveClass('bg-megasena');
    });

    it('applies correct size class', () => {
        const { container } = render(<NumberBall number={15} size="lg" />);
        expect(container.firstChild).toHaveClass('w-16', 'h-16');
    });

    it('is accessible with custom aria-label', () => {
        render(<NumberBall number={23} aria-label="Número sorteado 23" />);
        const element = screen.getByRole('img');
        expect(element).toHaveAccessibleName('Número sorteado 23');
    });

    it('has default aria-label', () => {
        render(<NumberBall number={42} />);
        const element = screen.getByRole('img');
        expect(element).toHaveAccessibleName('Número 42');
    });

    it('applies highlighted state', () => {
        const { container } = render(<NumberBall number={7} state="highlighted" />);
        expect(container.firstChild).toHaveClass('ring-4');
    });

    it('applies winner state with animation', () => {
        const { container } = render(<NumberBall number={13} state="winner" />);
        expect(container.firstChild).toHaveClass('animate-pulse');
    });
});
