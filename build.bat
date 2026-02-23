@echo off
echo Limpiando build anterior...
if exist dist rmdir /s /q dist
echo.
echo Construyendo aplicacion...
call npm run build
echo.
echo Build completado!
pause
