# Guia de Comandos Backend - Configuração JWT Blacklist

## Após atualizar requirements.txt

```bash
cd backend

# 1. Instalar nova dependência
pip install -r requirements.txt

# 2. Rodar migração para criar tabelas do blacklist
python manage.py migrate

# 3. Verificar que tabelas foram criadas
python manage.py showmigrations token_blacklist
```

## Resultado Esperado

Serão criadas as tabelas:
- `token_blacklist_outstandingtoken` - Tokens emitidos
- `token_blacklist_blacklistedtoken` - Tokens revogados

## Como usar no frontend

```typescript
// Ao fazer logout
const response = await apiClient.post('/auth/logout/', {
  refresh: localStorage.getItem('refresh_token')
});

clearAuthTokens(); // Remove do localStorage
```

Isso marca o token como inválido no backend.
