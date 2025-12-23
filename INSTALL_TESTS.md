# Guia de Instalação - Dependências de Teste

## Instalação Rápida

Execute este comando para instalar todas as dependências de teste:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui @vitest/coverage-v8 jsdom
```

## Dependências Instaladas

| Pacote | Versão | Propósito |
|--------|--------|-----------|
| `vitest` | latest | Framework de testes (alternativa ao Jest) |
| `@testing-library/react` | latest | Utilitários para testar React |
| `@testing-library/jest-dom` | latest | Matchers customizados (toBeInTheDocument, etc) |
| `@testing-library/user-event` | latest | Simular interações do usuário |
| `@vitest/ui` | latest | Interface visual para testes |
| `@vitest/coverage-v8` | latest | Relatórios de cobertura |
| `jsdom` | latest | Ambiente DOM para Node.js |

## Comandos de Teste

Após instalação, use:

```bash
# Executar testes (watch mode)
npm test

# Executar com interface visual
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

## Estrutura Criada

```
src/
├── test/
│   └── setup.ts                    ✅ Setup global
├── design-system/
│   └── atoms/
│       ├── NumberBall/
│       │   ├── NumberBall.tsx
│       │   └── NumberBall.test.tsx  ✅ 8 testes
│       └── PrizeLabel/
│           ├── PrizeLabel.tsx
│           └── PrizeLabel.test.tsx  ✅ 6 testes
└── ...

vitest.config.ts                     ✅ Configuração
```

##  Como Executar

1. **Instalar dependências**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui @vitest/coverage-v8 jsdom
```

2. **Rodar testes**:
```bash
npm test
```

Deve mostrar:
```
 ✓ src/design-system/atoms/NumberBall/NumberBall.test.tsx (8)
 ✓ src/design-system/atoms/PrizeLabel/PrizeLabel.test.tsx (6)

 Test Files  2 passed (2)
      Tests  14 passed (14)
```

## Próximos Passos

- Adicionar testes para outros átomos (LoadingSpinner, StatusBadge, etc)
- Testar moléculas (DrawResult, PrizeBreakdown, etc)
- Meta: 80% de cobertura
