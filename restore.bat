@echo off
echo ==========================================
echo Restaurando Ambiente do Backend...
echo ==========================================

cd backend

IF NOT EXIST .env (
    echo Copiando .env.example para .env...
    copy .env.example .env
)

echo.
echo [1/6] Instalando dependencias...
call venv\Scripts\activate
pip install -r requirements.txt

echo.
echo [2/6] Rodando Migrations Iniciais...
python manage.py migrate

echo.
echo [3/6] Migrations App Tickets...
python manage.py makemigrations tickets
python manage.py migrate

echo.
echo [4/6] Migrations App Generator...
python manage.py makemigrations generator
python manage.py migrate

echo.
echo [5/6] Carregando Loterias...
python manage.py loaddata initial_lotteries

echo.
echo [6/6] Recalculando Estatisticas (Task)...
python -c "import os, django; os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev'); django.setup(); from apps.stats.tasks import recompute_all_stats; print('Disparando task...'); recompute_all_stats.delay()"

echo.
echo Restauracao concluida!
pause
