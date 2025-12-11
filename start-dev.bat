@echo off
REM Batch wrapper para ejecutar el script de PowerShell
REM Uso: start-dev.bat [SeedData]

powershell.exe -ExecutionPolicy Bypass -File "%~dp0start-dev.ps1" %*
pause
