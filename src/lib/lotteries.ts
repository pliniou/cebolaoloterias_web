import { 
  Clover, 
  Star, 
  Heart, 
  Flame, 
  Trophy, 
  Clock, 
  Sun, 
  Zap, 
  Award, 
  Target,
  Gem 
} from "lucide-react";

export interface LotteryInfo {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: typeof Clover;
  description: string;
  numbers: number;
  range: [number, number];
  prize?: string;
}

export const lotteries: LotteryInfo[] = [
  {
    id: "megasena",
    name: "Mega-Sena",
    slug: "megasena",
    color: "megasena",
    icon: Clover,
    description: "A maior loteria do Brasil",
    numbers: 6,
    range: [1, 60],
    prize: "R$ 45.000.000",
  },
  {
    id: "quina",
    name: "Quina",
    slug: "quina",
    color: "quina",
    icon: Star,
    description: "Sorteios de segunda a sábado",
    numbers: 5,
    range: [1, 80],
    prize: "R$ 12.500.000",
  },
  {
    id: "lotofacil",
    name: "Lotofácil",
    slug: "lotofacil",
    color: "lotofacil",
    icon: Heart,
    description: "A loteria mais fácil de ganhar",
    numbers: 15,
    range: [1, 25],
    prize: "R$ 5.000.000",
  },
  {
    id: "lotomania",
    name: "Lotomania",
    slug: "lotomania",
    color: "lotomania",
    icon: Flame,
    description: "Escolha 50 números e concorra",
    numbers: 50,
    range: [0, 99],
    prize: "R$ 8.200.000",
  },
  {
    id: "duplasena",
    name: "Dupla Sena",
    slug: "duplasena",
    color: "duplasena",
    icon: Trophy,
    description: "Dois sorteios por concurso",
    numbers: 6,
    range: [1, 50],
    prize: "R$ 3.500.000",
  },
  {
    id: "timemania",
    name: "Timemania",
    slug: "timemania",
    color: "timemania",
    icon: Target,
    description: "Torça pelo seu time do coração",
    numbers: 10,
    range: [1, 80],
    prize: "R$ 15.000.000",
  },
  {
    id: "diadesorte",
    name: "Dia de Sorte",
    slug: "diadesorte",
    color: "diadesorte",
    icon: Sun,
    description: "Escolha seu mês da sorte",
    numbers: 7,
    range: [1, 31],
    prize: "R$ 2.800.000",
  },
  {
    id: "supersete",
    name: "Super Sete",
    slug: "supersete",
    color: "supersete",
    icon: Zap,
    description: "A mais nova loteria da Caixa",
    numbers: 7,
    range: [0, 9],
    prize: "R$ 4.500.000",
  },
  {
    id: "federal",
    name: "Federal",
    slug: "federal",
    color: "federal",
    icon: Award,
    description: "A loteria tradicional do Brasil",
    numbers: 5,
    range: [0, 99999],
    prize: "R$ 500.000",
  },
  {
    id: "loteca",
    name: "Loteca",
    slug: "loteca",
    color: "loteca",
    icon: Target,
    description: "Aposte nos jogos de futebol",
    numbers: 14,
    range: [1, 2],
    prize: "R$ 1.500.000",
  },
  {
    id: "maismilionaria",
    name: "+Milionária",
    slug: "maismilionaria",
    color: "maismilionaria",
    icon: Gem,
    description: "A loteria dos milhões",
    numbers: 6,
    range: [1, 50],
    prize: "R$ 200.000.000",
  },
];

export function getLotteryBySlug(slug: string): LotteryInfo | undefined {
  return lotteries.find((lottery) => lottery.slug === slug);
}
