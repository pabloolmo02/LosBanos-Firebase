@echo off
echo Desplegando reglas de Firestore...
call npx firebase deploy --only firestore:rules
echo.
echo Reglas desplegadas!
pause
