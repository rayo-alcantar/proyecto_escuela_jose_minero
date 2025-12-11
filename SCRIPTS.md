# 📖 Guía de Scripts de Inicio

## Script de Inicio Automatizado

El proyecto incluye scripts automatizados para facilitar el inicio del desarrollo.

---

## 📁 Archivos

### `start-dev.ps1`
Script principal de PowerShell con todas las validaciones y lógica de inicio.

### `start-dev.bat`
Wrapper de Batch que permite ejecutar el script de PowerShell con doble clic.
> Tip: ambos aceptan el switch `SeedData` para correr `npm run seed` en el backend antes de levantar servicios (ej. `.\start-dev.ps1 -SeedData` o `start-dev.bat SeedData`).
---

## 🚀 Uso

### Método 1: Doble Clic (Más fácil)
1. Navega a la carpeta raíz del proyecto en el Explorador de Windows
2. Haz doble clic en `start-dev.bat`
3. Sigue las instrucciones en pantalla

### Método 2: PowerShell
```powershell
cd c:\ruta\a\tu\proyecto\apis
.\start-dev.ps1
```

### Método 3: Desde CMD
```cmd
cd c:\ruta\a\tu\proyecto\apis
start-dev.bat
```

---

## ✅ Validaciones que Realiza

El script verifica automáticamente:

1. **Node.js instalado**
   - Verifica que Node.js esté disponible
   - Muestra la versión instalada

2. **npm instalado**
   - Confirma que npm esté disponible
   - Muestra la versión instalada

3. **MongoDB corriendo**
   - Verifica si MongoDB está activo
   - Intenta iniciarlo automáticamente si no está corriendo
   - Pregunta si deseas continuar si no puede verificarlo

4. **Estructura del proyecto**
   - Verifica que existan las carpetas `escuela_API` y `proyecto-escuela`

5. **Archivos .env**
   - Verifica que existan los archivos `.env` en backend y frontend
   - Si no existen, los crea automáticamente desde `.env.example`

6. **Dependencias instaladas**
   - Verifica que existan las carpetas `node_modules`
   - Ejecuta `npm install` automáticamente si faltan

7. **Puertos disponibles**
   - Verifica que los puertos 4000 (backend) y 3000 (frontend) estén libres
   - Advierte si ya están en uso

---

## 🎯 Comportamiento

### Inicio de Servicios

El script abre **dos nuevas ventanas de PowerShell**:

1. **Ventana Backend** (Puerto 4000)
   - Ejecuta `npm run dev` en la carpeta `escuela_API`
   - Muestra los logs del servidor Express

2. **Ventana Frontend** (Puerto 3000)
   - Ejecuta `npm start` en la carpeta `proyecto-escuela`
   - Abre automáticamente el navegador

### Ventana Principal

La ventana principal del script muestra:
- Resumen de todas las validaciones
- URLs de acceso a los servicios
- Información sobre cómo detener los servicios

---

## 🛑 Detener los Servicios

Para detener los servicios, tienes dos opciones:

1. **Cerrar las ventanas** de PowerShell del backend y frontend
2. Presionar **Ctrl+C** en cada ventana

---

## ⚠️ Solución de Problemas

### Error: "No se puede ejecutar scripts en este sistema"

Si ves el error relacionado con la política de ejecución:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Luego vuelve a ejecutar el script.

### MongoDB no inicia automáticamente

Si el script no puede iniciar MongoDB:

1. **Verifica que MongoDB esté instalado**
   ```cmd
   mongod --version
   ```

2. **Inicia MongoDB manualmente**
   ```cmd
   mongod
   ```

3. **O usa MongoDB como servicio de Windows**
   ```cmd
   net start MongoDB
   ```

### Puerto ya en uso

Si los puertos 4000 o 3000 están en uso:

1. **Encuentra qué proceso los está usando:**
   ```powershell
   Get-NetTCPConnection -LocalPort 4000
   Get-NetTCPConnection -LocalPort 3000
   ```

2. **Detén el proceso si es necesario:**
   ```powershell
   Stop-Process -Id <PID>
   ```

### Dependencias no se instalan

Si `npm install` falla:

1. **Limpia la caché de npm:**
   ```cmd
   npm cache clean --force
   ```

2. **Elimina node_modules y reinstala:**
   ```cmd
   rmdir /s /q node_modules
   npm install
   ```

---

## 🎨 Personalización

### Cambiar Puertos

Edita las variables al inicio de `start-dev.ps1`:

```powershell
$BACKEND_PORT = 4000   # Cambia a tu puerto preferido
$FRONTEND_PORT = 3000  # Cambia a tu puerto preferido
```

### Cambiar URI de MongoDB

Edita la variable:

```powershell
$MONGODB_URI = "mongodb://127.0.0.1:27017/escuela_jose_minero"
```

---

## 📝 Características Avanzadas

### Salida con Colores

El script usa colores para mejorar la legibilidad:
- 🟢 Verde: Operaciones exitosas
- 🔴 Rojo: Errores
- 🟡 Amarillo: Advertencias
- 🔵 Cyan: Información
- 🟣 Magenta: Pasos principales

### Manejo de Errores

El script tiene manejo robusto de errores:
- Detiene la ejecución en errores críticos
- Permite continuar en advertencias
- Pregunta al usuario antes de acciones potencialmente problemáticas

### Validación de Puertos

Usa `Get-NetTCPConnection` para verificar si los puertos están en uso, evitando conflictos.

---

## 🔒 Seguridad

El script:
- ✅ **NO modifica archivos** fuera del proyecto
- ✅ **NO requiere permisos de administrador**
- ✅ Copia `.env.example` a `.env` pero **NO los edita**
- ✅ Solo instala dependencias declaradas en `package.json`

---

## 💡 Consejos

1. **Primera ejecución**: La primera vez puede tardar varios minutos instalando dependencias
2. **MongoDB**: Asegúrate de tener MongoDB corriendo antes de usar la aplicación
3. **Puertos**: Si cambias los puertos, actualiza también los archivos `.env`
4. **Desarrollo**: Deja las ventanas de PowerShell abiertas mientras desarrollas

---

**¡Disfruta desarrollando! 🚀**
