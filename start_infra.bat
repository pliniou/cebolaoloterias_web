@echo off
echo Iniciando Infraestrutura (Postgres + Redis) via Docker...
echo Certifique-se que o Docker Desktop esta rodando.
cd backend
docker-compose up -d postgres redis
echo.
echo Infraestrutura iniciada! Aguardando 10 segundos para inicializacao do banco...
timeout /t 10 /nobreak
pause
