@echo off
echo Iniciando Backend Django...
cd backend
call venv\Scripts\activate
python manage.py runserver
pause
