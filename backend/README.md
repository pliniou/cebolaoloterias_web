# Backend - Cebola Loterias

API RESTful desenvolvida com Django e Django Rest Framework (DRF) para gestão de loterias, apostas, estatísticas e geração de jogos.

## Stack Tecnológica

- **Python 3.12+**
- **Django 5.0+**
- **Django Rest Framework**
- **PostgreSQL 16**
- **Redis 7** (Cache & Broker)
- **Celery 5.3** (Tasks Assíncronas)
- **Docker & Docker Compose**

## Arquitetura dos Apps

O projeto é dividido em apps modulares:

### 1. `core`
Base do projeto. Contém configurações, autenticação JWT, integração com Docker e rotas principais.

### 2. `lotteries` (Loterias)
Gerencia as modalidades e sorteios.
- **Sync**: Integração com API da CAIXA para sincronizar resultados.
- **Suporte**: Mega-Sena, Lotofácil, Quina, Lotomania, Timemania, Dupla Sena, Federal, Dia de Sorte, Super Sete.

### 3. `tickets` (Bilhetes)
Gestão de apostas do usuário.
- **Conferência**: Serviço que compara bilhetes com sorteios e calcula premiação.
- **Histórico**: Registro detalhado de acertos e valores.

### 4. `stats` (Estatísticas)
Motor de cálculo estatístico.
- **Métricas**: Soma, Paridade, Primos, Consecutivos, Repetidos, Amplitude.
- **Cache**: Agregações pesadas cacheadas em Redis.
- **Automação**: Recálculo automático via Celery/Signals.

### 5. `generator` (Gerador)
Engine de geração de palpites.
- **Presets**: Configurações de estratégia salvas pelo usuário.
- **Validadores**: Filtros de Soma, Pares, Primos, Exclusão, Fixos.

## Setup Local (Sem Docker)

### Pré-requisitos
- Python 3.12+
- PostgreSQL
- Redis

### Instalação

1. Criar ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

2. Instalar dependências:
   ```bash
   pip install -r requirements.txt
   ```

3. Configurar variáveis de ambiente:
   Copie `.env.example` para `.env` e ajuste as credenciais do banco/redis.

4. Migrations e Fixtures:
   ```bash
   python manage.py migrate
   python manage.py loaddata initial_lotteries
   ```

5. Criar superusuário:
   ```bash
   python manage.py createsuperuser
   ```

6. Rodar servidor:
   ```bash
   python manage.py runserver
   ```

7. Rodar Celery (em outro terminal):
   ```bash
   celery -A core worker -l info -P eventlet  # Windows
   celery -A core worker -l info             # Linux/Mac
   ```

## Setup com Docker (Recomendado)

```bash
docker-compose up --build
```

O backend estará disponível em `http://localhost:8000`.

## Documentação da API

A documentação interativa (Swagger UI) está disponível em:
- **http://localhost:8000/api/docs/**

## Testes

Rodar suite de testes com Pytest:
```bash
pytest
```
coverage:
```bash
pytest --cov=.
```
