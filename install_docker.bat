@echo off
echo ==========================================
echo Instalador de Dependencias (Via Winget)
echo ==========================================
echo.
echo Este script tentara instalar o Docker Desktop.
echo Voce pode precisar aceitar prompts de Administrador (UAC).
echo.
pause

echo Instalando Docker Desktop...
winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements

echo.
echo ==========================================
echo IMPORTANTE:
echo 1. Se a instalacao foi concluida, REINICIE seu computador.
echo 2. Apos reiniciar, abra o Docker Desktop e aceite os termos.
echo 3. Volte aqui e rode 'start_infra.bat'.
echo ==========================================
pause
