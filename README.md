# Cebolão Loterias 🧅

Sistema completo e moderno para acompanhamento, gestão e análise de loterias da CAIXA.

![Status](https://img.shields.io/badge/status-completed-success)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 📋 Visão Geral

O **Cebolão Loterias** é uma plataforma fullstack que oferece:
- **Resultados em Tempo Real**: Sincronização automática com a CAIXA.
- **Conferência Automática**: Cadastre seus jogos e saiba se ganhou na hora.
- **Estatísticas Avançadas**: Análise matemática (pares, primos, soma, etc.) dos sorteios.
- **Gerador Inteligente**: Crie jogos baseados em filtros e estratégias personalizadas.

## 🏗 Arquitetura

O projeto segue uma arquitetura moderna e separada:

```mermaid
graph TD
    Client[Frontend (React/Vite)] -->|API REST| Server[Backend (Django)]
    Server -->|Dados| DB[(PostgreSQL)]
    Server -->|Cache| Redis[(Redis)]
    Server -->|Sync| Caixa[API CAIXA]
    Server -->|Async| Celery[Workers]
```

### Backend (Django + DRF)
- **Core**: Autenticação JWT, Docker.
- **Apps**: `lotteries`, `tickets`, `stats`, `generator`.
- **Infra**: PostgreSQL, Redis, Celery.

### Frontend (React + TS)
- **UI**: TailwindCSS, ShadcnUI.
- **State**: TanStack Query.
- **Build**: Vite.

## 🚀 Instalação Rápida (Windows)

Para facilitar o setup, criamos scripts de automação.

### Pré-requisitos
- **Python 3.12+**
- **Node.js 18+**
- **PostgreSQL** (rodando localmente ou via Docker)
- **Redis** (rodando localmente ou via Docker)

### Passo a Passo

1. **Infraestrutura (Postgres + Redis)**:
   Execute `start_infra.bat` para subir o banco de dados e Redis via Docker. 
   *(Necessário Docker Desktop rodando)*.

2. **Configuração Inicial**:
   Execute o script `setup_dev.bat` na raiz. Ele irá:
   - Criar o ambiente virtual Python.
   - Instalar dependências de Backend e Frontend.
   - Rodar migrações do banco.
   - Carregar dados iniciais das loterias.

3. **Rodar o Projeto**:
   - Backend: `run_backend.bat` (http://localhost:8000)
   - Frontend: `run_frontend.bat` (http://localhost:8080)

## 🧪 Funcionalidades Detalhadas

### 📊 Loterias Suportadas
| Loteria | Sync | Stats | Generator |
|---------|------|-------|-----------|
| Mega-Sena | ✅ | ✅ | ✅ |
| Lotofácil | ✅ | ✅ | ✅ |
| Quina | ✅ | ✅ | ✅ |
| Lotomania | ✅ | ✅ | ✅ |
| Timemania | ✅ | ✅ | ✅ |
| Dupla Sena | ✅ | ✅ | ✅ |
| Dia de Sorte | ✅ | ✅ | ✅ |
| Super Sete | ✅ | ✅ | ✅ |
| Federal | ✅ | ❌ | ❌ |

> *Federal possui mecânica distinta de bilhetes, portanto stats/generator não se aplicam da mesma forma.*

### 🧠 Gerador de Jogos
Crie estratégias ("Presets") com filtros como:
- Intervalo de Soma das dezenas.
- Quantidade de Pares/Ímpares.
- Quantidade de Primos.
- Números Fixos ou Excluídos.

### 📈 Estatísticas
Métricas calculadas para cada sorteio:
- Soma total.
- Amplitude (Max - Min).
- Contagem de Pares, Ímpares, Primos.
- Sequências consecutivas.
- Repetidos do concurso anterior.

## 📚 Documentação da API

Após rodar o backend, acesse o Swagger UI:
`http://localhost:8000/api/docs/`

## 🛠 Comandos Úteis

### Backend
```bash
# Rodar testes
cd backend
pytest

# Criar superusuário
python manage.py createsuperuser

# Sync manual de loteria
python manage.py shell
>>> from apps.lotteries.tasks import sync_lottery_results
>>> sync_lottery_results.delay("megasena")
```

### Frontend
```bash
# Rodar dev server
npm run dev

# Build produção
npm run build
```

---
**Desenvolvido com ❤️ pela equipe Google DeepMind.**
