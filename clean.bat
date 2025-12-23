@echo off
echo ===================================================
echo   Cebolao Loterias - Limpeza de Cache e Build
echo ===================================================

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo.
echo [+] Removendo pasta 'dist' (build artifacts)...
if exist "dist" rd /s /q "dist"

echo [+] Removendo pasta 'node_modules/.vite' (vite cache)...
if exist "node_modules\.vite" rd /s /q "node_modules\.vite"

echo [+] Removendo cache do Typescript...
if exist "tsconfig.tsbuildinfo" del /q "tsconfig.tsbuildinfo"

echo.
echo [!] NOTA: 'node_modules' completo NAO foi removido para evitar Re-install demorado.
echo [!] Use 'rd /s /q node_modules' manualmente se precisar de uma limpeza total.
echo.
echo ===================================================
echo   Limpeza concluida com sucesso!
echo ===================================================
pause
