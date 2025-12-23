/**
 * NumberBall - Átomo base para exibir números de loteria
 * Componente fundamental do DS CAIXA para representação visual de números sorteados
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const numberBallVariants = cva(
    'rounded-full flex items-center justify-center font-bold transition-all select-none',
    {
        variants: {
            lottery: {
                megasena: 'bg-megasena text-white',
                lotofacil: 'bg-lotofacil text-white',
                quina: 'bg-quina text-white',
                lotomania: 'bg-lotomania text-white',
                duplasena: 'bg-duplasena text-white',
                timemania: 'bg-timemania text-white',
                diadesorte: 'bg-diadesorte text-white',
                supersete: 'bg-supersete text-white',
                federal: 'bg-federal text-white',
                loteca: 'bg-loteca text-white',
                maismilionaria: 'bg-maismilionaria text-white',
                default: 'bg-primary text-primary-foreground',
            },
            size: {
                xs: 'w-6 h-6 text-xs',
                sm: 'w-8 h-8 text-sm',
                md: 'w-12 h-12 text-base',
                lg: 'w-16 h-16 text-lg',
                xl: 'w-20 h-20 text-xl',
            },
            state: {
                default: 'opacity-100',
                highlighted: 'ring-4 ring-azul-caixa ring-offset-2 scale-110 shadow-lg',
                dimmed: 'opacity-40',
                winner: 'ring-4 ring-laranja-caixa ring-offset-2 animate-pulse',
            },
            animated: {
                true: 'animate-fade-in',
                false: '',
            },
        },
        defaultVariants: {
            size: 'md',
            state: 'default',
            lottery: 'default',
            animated: false,
        },
    }
);

export interface NumberBallProps extends VariantProps<typeof numberBallVariants> {
    /** Número a ser exibido (1-100) */
    number: number;
    /** Delay para animação em cascata (ms) */
    delay?: number;
    /** Classe CSS adicional */
    className?: string;
    /** Label acessível customizado */
    'aria-label'?: string;
}

/**
 * NumberBall - Componente atômico para exibição de números
 * 
 * @example
 * // Número da Mega-Sena
 * <NumberBall number={42} lottery="megasena" size="md" />
 * 
 * @example
 * // Número vencedor destacado
 * <NumberBall number={15} lottery="lotofacil" state="winner" />
 * 
 * @example
 * // Grid com animação em cascata
 * {numbers.map((num, i) => (
 *   <NumberBall key={i} number={num} lottery="quina" delay={i * 100} animated />
 * ))}
 */
export const NumberBall = ({
    number,
    lottery,
    size,
    state,
    animated,
    delay = 0,
    className,
    ...props
}: NumberBallProps) => {
    const displayNumber = number.toString().padStart(2, '0');

    return (
        <div
            className={cn(numberBallVariants({ lottery, size, state, animated }), className)}
            role="img"
            aria-label={props['aria-label'] || `Número ${number}`}
            style={{
                animationDelay: animated ? `${delay}ms` : undefined,
            }}
        >
            {displayNumber}
        </div>
    );
};

NumberBall.displayName = 'NumberBall';
