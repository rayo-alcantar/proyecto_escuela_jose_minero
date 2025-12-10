@echo off
REM Batch wrapper para ejecutar el script de PowerShell
REM Esto permite hacer doble clic en el archivo para ejecutarlo

powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1"
pause
