@echo off
echo ===========================================
echo   Cebola Loterias - Setup de Desenvolvimento
echo ===========================================
echo.

REM Verifica Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python nao encontrado. Instale o Python 3.12+.
    pause
    exit /b
)

REM Verifica Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado. Instale o Node 18+.
    pause
    exit /b
)

echo [1/4] Configurando Backend...
cd backend

IF NOT EXIST venv (
    echo Criando ambiente virtual...
    python -m venv venv
)

echo Ativando venv e instalando dependencias...
call venv\Scripts\activate
pip install -r requirements.txt

IF NOT EXIST .env (
    echo Criando .env a partir do exemplo...
    copy .env.example .env
    echo [AVISO] Lembrar de configurar o banco de dados no .env!
)

echo Rodando migracoes...
python manage.py migrate

echo Carregando loterias iniciais...
python manage.py loaddata initial_lotteries

cd ..

echo.
echo [2/4] Configurando Frontend...
echo Instalando dependencias do Node...
npm install

echo.
echo [3/4] Setup Concluido!
echo.
echo Para rodar o projeto:
echo 1. Em um terminal: run_backend.bat
echo 2. Em outro terminal: run_frontend.bat
echo.
pause
