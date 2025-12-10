#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script de inicio para el Sistema de Gestion Escolar (Monorepo)
    Mata automaticamente los procesos cuando se cierra

.DESCRIPTION
    Verifica la configuracion completa del proyecto y levanta tanto el backend
    como el frontend en modo desarrollo. Al cerrar este script, mata
    automaticamente todos los procesos hijos.

.EXAMPLE
    .\start-dev.ps1
#>

# ============================================
# Configuracion
# ============================================
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$BACKEND_DIR = "escuela_API"
$FRONTEND_DIR = "proyecto-escuela"
$BACKEND_PORT = 4000
$FRONTEND_PORT = 3000
$MONGODB_URI = "mongodb://127.0.0.1:27017/escuela_jose_minero"

# Variables globales para procesos
$Global:BackendProcess = $null
$Global:FrontendProcess = $null
$Global:BackendJob = $null
$Global:FrontendJob = $null

# ============================================
# Funciones de Utilidad
# ============================================

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[OK] $Message" "Green"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[AVISO] $Message" "Yellow"
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-ColorOutput "===> $Message" "Magenta"
}

function Test-CommandExists {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Test-MongoDBRunning {
    try {
        $mongoProcess = Get-Process -Name "mongod" -ErrorAction SilentlyContinue
        if ($null -ne $mongoProcess) {
            return $true
        }
        
        # Intentar conectar al puerto de MongoDB
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", 27017)
        $tcpClient.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Stop-OnError {
    param([string]$Message)
    Write-Error $Message
    Write-Host ""
    Write-ColorOutput "Presiona cualquier tecla para salir..." "Gray"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

function Stop-AllProcesses {
    Write-Host ""
    Write-Info "Deteniendo procesos..."
    
    # Detener proceso del backend
    if ($Global:BackendProcess -and !$Global:BackendProcess.HasExited) {
        try {
            Stop-Process -Id $Global:BackendProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Success "Backend detenido (PID: $($Global:BackendProcess.Id))"
        }
        catch {
            Write-Warning "No se pudo detener el backend"
        }
    }
    
    # Detener proceso del frontend
    if ($Global:FrontendProcess -and !$Global:FrontendProcess.HasExited) {
        try {
            Stop-Process -Id $Global:FrontendProcess.Id -Force -ErrorAction SilentlyContinue
            Write-Success "Frontend detenido (PID: $($Global:FrontendProcess.Id))"
        }
        catch {
            Write-Warning "No se pudo detener el frontend"
        }
    }
    
    # Matar cualquier proceso node en los puertos especificos
    $portsToClean = @($BACKEND_PORT, $FRONTEND_PORT)
    foreach ($port in $portsToClean) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            try {
                $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                if ($process) {
                    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
                    Write-Info "Proceso en puerto $port detenido"
                }
            }
            catch {
                # Ignorar errores
            }
        }
    }
    
    Write-Success "Limpieza completada"
}

# Registrar handler para Ctrl+C
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Stop-AllProcesses
}

# ============================================
# Banner
# ============================================
Clear-Host
Write-Host ""
Write-ColorOutput "=========================================================" "Cyan"
Write-ColorOutput "       Sistema de Gestion Escolar - Dev Starter        " "Cyan"
Write-ColorOutput "=========================================================" "Cyan"
Write-Host ""

# ============================================
# Validaciones Previas
# ============================================

Write-Step "1. Verificando requisitos del sistema"

# Verificar Node.js
Write-Info "Verificando Node.js..."
if (-not (Test-CommandExists "node")) {
    Stop-OnError "Node.js no esta instalado. Por favor instala Node.js desde https://nodejs.org/"
}
$nodeVersion = node --version
Write-Success "Node.js instalado: $nodeVersion"

# Verificar npm
Write-Info "Verificando npm..."
if (-not (Test-CommandExists "npm")) {
    Stop-OnError "npm no esta instalado."
}
$npmVersion = npm --version
Write-Success "npm instalado: v$npmVersion"

# Verificar MongoDB
Write-Info "Verificando MongoDB..."
if (-not (Test-MongoDBRunning)) {
    Write-Warning "MongoDB no esta corriendo."
    Write-Info "Intentando iniciar MongoDB..."
    
    if (Test-CommandExists "mongod") {
        try {
            Start-Process "mongod" -WindowStyle Hidden
            Start-Sleep -Seconds 3
            
            if (Test-MongoDBRunning) {
                Write-Success "MongoDB iniciado correctamente"
            }
            else {
                Write-Warning "No se pudo verificar MongoDB. Continuando de todas formas..."
            }
        }
        catch {
            Write-Warning "No se pudo iniciar MongoDB automaticamente."
            Write-Info "Por favor, inicia MongoDB manualmente antes de continuar."
            Write-Info "Comando: mongod"
            Write-Host ""
            $continue = Read-Host "Deseas continuar de todas formas? (s/n)"
            if ($continue -ne "s" -and $continue -ne "S") {
                exit 0
            }
        }
    }
    else {
        Write-Warning "MongoDB no esta instalado o no esta en el PATH."
        Write-Info "Asegurate de que MongoDB este corriendo en 127.0.0.1:27017"
        Write-Host ""
        $continue = Read-Host "Deseas continuar de todas formas? (s/n)"
        if ($continue -ne "s" -and $continue -ne "S") {
            exit 0
        }
    }
}
else {
    Write-Success "MongoDB esta corriendo"
}

# ============================================
# Validacion de Estructura del Proyecto
# ============================================

Write-Step "2. Verificando estructura del proyecto"

# Verificar directorios
Write-Info "Verificando directorios..."
if (-not (Test-Path $BACKEND_DIR)) {
    Stop-OnError "No se encontro el directorio del backend: $BACKEND_DIR"
}
Write-Success "Directorio backend encontrado"

if (-not (Test-Path $FRONTEND_DIR)) {
    Stop-OnError "No se encontro el directorio del frontend: $FRONTEND_DIR"
}
Write-Success "Directorio frontend encontrado"

# ============================================
# Validacion de Configuracion - Backend
# ============================================

Write-Step "3. Validando configuracion del Backend"

# Verificar .env del backend
$backendEnv = Join-Path $BACKEND_DIR ".env"
if (-not (Test-Path $backendEnv)) {
    Write-Warning "Archivo .env no encontrado en el backend"
    Write-Info "Creando .env desde .env.example..."
    
    $backendEnvExample = Join-Path $BACKEND_DIR ".env.example"
    if (Test-Path $backendEnvExample) {
        Copy-Item $backendEnvExample $backendEnv
        Write-Success "Archivo .env creado en el backend"
    }
    else {
        Stop-OnError "No se encontro .env.example en el backend. No se puede continuar."
    }
}
else {
    Write-Success "Archivo .env encontrado en el backend"
}

# Verificar node_modules del backend
$backendNodeModules = Join-Path $BACKEND_DIR "node_modules"
if (-not (Test-Path $backendNodeModules)) {
    Write-Warning "Dependencias no instaladas en el backend"
    Write-Info "Instalando dependencias del backend..."
    
    Push-Location $BACKEND_DIR
    try {
        npm install
        Write-Success "Dependencias del backend instaladas"
    }
    catch {
        Pop-Location
        Stop-OnError "Error al instalar dependencias del backend: $_"
    }
    Pop-Location
}
else {
    Write-Success "Dependencias del backend ya instaladas"
}

# ============================================
# Validacion de Configuracion - Frontend
# ============================================

Write-Step "4. Validando configuracion del Frontend"

# Verificar .env del frontend
$frontendEnv = Join-Path $FRONTEND_DIR ".env"
if (-not (Test-Path $frontendEnv)) {
    Write-Warning "Archivo .env no encontrado en el frontend"
    Write-Info "Creando .env desde .env.example..."
    
    $frontendEnvExample = Join-Path $FRONTEND_DIR ".env.example"
    if (Test-Path $frontendEnvExample) {
        Copy-Item $frontendEnvExample $frontendEnv
        Write-Success "Archivo .env creado en el frontend"
    }
    else {
        Stop-OnError "No se encontro .env.example en el frontend. No se puede continuar."
    }
}
else {
    Write-Success "Archivo .env encontrado en el frontend"
}

# Verificar node_modules del frontend
$frontendNodeModules = Join-Path $FRONTEND_DIR "node_modules"
if (-not (Test-Path $frontendNodeModules)) {
    Write-Warning "Dependencias no instaladas en el frontend"
    Write-Info "Instalando dependencias del frontend (esto puede tardar)..."
    
    Push-Location $FRONTEND_DIR
    try {
        npm install
        Write-Success "Dependencias del frontend instaladas"
    }
    catch {
        Pop-Location
        Stop-OnError "Error al instalar dependencias del frontend: $_"
    }
    Pop-Location
}
else {
    Write-Success "Dependencias del frontend ya instaladas"
}

# ============================================
# Verificacion de Puertos
# ============================================

Write-Step "5. Verificando disponibilidad de puertos"

Write-Info "Verificando puerto $BACKEND_PORT (Backend)..."
if (Test-PortInUse $BACKEND_PORT) {
    Write-Warning "El puerto $BACKEND_PORT ya esta en uso"
    Write-Info "Es posible que el backend ya este corriendo"
    $continue = Read-Host "Deseas continuar de todas formas? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}
else {
    Write-Success "Puerto $BACKEND_PORT disponible"
}

Write-Info "Verificando puerto $FRONTEND_PORT (Frontend)..."
if (Test-PortInUse $FRONTEND_PORT) {
    Write-Warning "El puerto $FRONTEND_PORT ya esta en uso"
    Write-Info "Es posible que el frontend ya este corriendo"
    $continue = Read-Host "Deseas continuar de todas formas? (s/n)"
    if ($continue -ne "s" -and $continue -ne "S") {
        exit 0
    }
}
else {
    Write-Success "Puerto $FRONTEND_PORT disponible"
}

# ============================================
# Iniciar Servicios
# ============================================

Write-Step "6. Iniciando servicios"

Write-Info "Iniciando Backend (Puerto $BACKEND_PORT)..."
$backendPath = Join-Path $PWD $BACKEND_DIR

# Iniciar backend en una nueva ventana de PowerShell
$Global:BackendProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host 'Backend API - Escuela' -ForegroundColor Green; Write-Host 'Puerto: $BACKEND_PORT' -ForegroundColor Cyan; Write-Host ''; npm run dev"
) -PassThru

Start-Sleep -Seconds 2
Write-Success "Backend iniciado en nueva ventana (PID: $($Global:BackendProcess.Id))"

Write-Info "Iniciando Frontend (Puerto $FRONTEND_PORT)..."
$frontendPath = Join-Path $PWD $FRONTEND_DIR

# Iniciar frontend en una nueva ventana de PowerShell
$Global:FrontendProcess = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host 'Frontend React - Escuela' -ForegroundColor Green; Write-Host 'Puerto: $FRONTEND_PORT' -ForegroundColor Cyan; Write-Host ''; npm start"
) -PassThru

Start-Sleep -Seconds 2
Write-Success "Frontend iniciando en nueva ventana (PID: $($Global:FrontendProcess.Id))"

# ============================================
# Finalizacion
# ============================================

Write-Host ""
Write-ColorOutput "=========================================================" "Green"
Write-ColorOutput "                    TODO LISTO!                          " "Green"
Write-ColorOutput "=========================================================" "Green"
Write-Host ""

Write-ColorOutput "Backend API:  http://localhost:$BACKEND_PORT" "Cyan"
Write-ColorOutput "Frontend:     http://localhost:$FRONTEND_PORT" "Cyan"
Write-Host ""
Write-ColorOutput "Health Check:   http://localhost:$BACKEND_PORT/health" "Gray"
Write-ColorOutput "API Base:       http://localhost:$BACKEND_PORT/api" "Gray"
Write-Host ""

Write-Info "Ambos servidores estan corriendo en ventanas separadas."
Write-Warning "Al presionar una tecla, SE DETENDRAN TODOS LOS PROCESOS automaticamente."
Write-Host ""

try {
    Write-ColorOutput "Presiona cualquier tecla para DETENER TODO y salir..." "Yellow"
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
finally {
    Stop-AllProcesses
}
