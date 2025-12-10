# 🏫 Sistema de Gestión Escolar - Monorepo

Sistema completo de gestión escolar con backend API RESTful y frontend web moderno.

## 📁 Estructura del Proyecto

```
apis/
├── escuela_API/          # Backend - API Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/       # Configuraciones (env, database)
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── models/       # Modelos de MongoDB
│   │   ├── routes/       # Rutas de la API
│   │   ├── middlewares/  # Middlewares (auth, errors)
│   │   └── utils/        # Utilidades
│   ├── tests/            # Tests automatizados
│   ├── package.json
│   └── .env              # Variables de entorno (NO incluido en Git)
│
├── proyecto-escuela/     # Frontend - React App
│   ├── src/
│   │   ├── componentes/  # Componentes React
│   │   ├── services/     # Servicios API
│   │   └── App.jsx       # Componente principal
│   ├── public/
│   ├── package.json
│   └── .env              # Variables de entorno (NO incluido en Git)
│
├── .gitignore            # Gitignore global del monorepo
├── start-dev.ps1         # 🚀 Script automatizado de inicio (PowerShell)
├── start-dev.bat         # 🚀 Script wrapper para doble clic
├── README.md             # Este archivo
└── SCRIPTS.md            # Documentación de scripts de inicio
```

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** v16 o superior
- **MongoDB** instalado y ejecutándose localmente
- **npm** o **yarn**

### ⚡ Opción 1: Script Automatizado (Recomendado)

La forma más rápida de iniciar el proyecto es usar el script automatizado que valida toda la configuración:

**Método A - Doble clic:**
1. Navega a la carpeta raíz del proyecto
2. Haz doble clic en `start-dev.bat`

**Método B - PowerShell:**
```powershell
cd apis
.\start-dev.ps1
```

**El script automáticamente:**
- ✅ Verifica que Node.js y MongoDB estén instalados
- ✅ Comprueba que MongoDB esté corriendo (lo inicia si es posible)
- ✅ Crea archivos `.env` si no existen
- ✅ Instala dependencias si faltan
- ✅ Verifica que los puertos estén disponibles
- ✅ Inicia backend y frontend en ventanas separadas

---

### 🔧 Opción 2: Configuración Manual

Si prefieres configurar manualmente o el script automatizado tiene problemas:

#### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd apis
```

#### 2. Configurar Backend

```bash
cd escuela_API
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env

# Editar .env con tus configuraciones si es necesario
```

**Archivo `.env` del backend** (escuela_API/.env):
```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/escuela_jose_minero
JWT_SECRET=super-secret-key-desarrollo-local-2024
JWT_EXPIRES_IN=8h
```

#### 3. Configurar Frontend

```bash
cd ../proyecto-escuela
npm install

# Crear archivo .env basado en .env.example
cp .env.example .env
```

**Archivo `.env` del frontend** (proyecto-escuela/.env):
```env
REACT_APP_API_URL=http://localhost:4000
```

### Ejecución

#### Ejecutar Backend (Puerto 4000)

```bash
cd escuela_API
npm run dev
```

El servidor estará disponible en: `http://localhost:4000`
- Health check: `http://localhost:4000/health`
- API base: `http://localhost:4000/api`

#### Ejecutar Frontend (Puerto 3000)

En otra terminal:

```bash
cd proyecto-escuela
npm start
```

La aplicación estará disponible en: `http://localhost:3000`

## 📡 Endpoints de la API

La API está disponible bajo el prefijo `/api`:

- **Autenticación**
  - `POST /api/auth/login` - Iniciar sesión
  - `POST /api/auth/register` - Registrar usuario (requiere permisos admin)

- **Usuarios**
  - `GET /api/users` - Listar usuarios
  - `GET /api/users/:id` - Obtener usuario
  - `POST /api/users` - Crear usuario
  - `PUT /api/users/:id` - Actualizar usuario
  - `DELETE /api/users/:id` - Eliminar usuario

- **Estudiantes**
  - `GET /api/students` - Listar estudiantes
  - `POST /api/students` - Crear estudiante
  - Ver más endpoints en la documentación de la API

- **Grupos, Materias, Tareas, Asistencia, Calificaciones**
  - Endpoints completos disponibles en `/api/groups`, `/api/subjects`, `/api/tasks`, `/api/attendance`, `/api/grades`, etc.

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para autenticación:

1. Hacer login en `/api/auth/login` con email y contraseña
2. El servidor devuelve un token JWT
3. Incluir el token en el header `Authorization: Bearer <token>` para peticiones protegidas

## 🧪 Tests

**Backend:**
```bash
cd escuela_API
npm test
```

**Frontend:**
```bash
cd proyecto-escuela
npm test
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** + **Mongoose** - Base de datos NoSQL
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **CORS** - Cross-Origin Resource Sharing

### Frontend
- **React** - Librería UI
- **React Router** - Navegación
- **Fetch API** - Peticiones HTTP

## 📝 Notas Importantes

### Variables de Entorno

⚠️ **NUNCA subir archivos `.env` a Git**. Los archivos `.env` contienen información sensible como:
- Claves secretas JWT
- Cadenas de conexión a base de datos
- Credenciales de servicios

Usar siempre los archivos `.env.example` como plantilla.

### Puerto de Desarrollo

- **Backend**: Puerto 4000 (configurable en `.env`)
- **Frontend**: Puerto 3000 (por defecto de Create React App)

Asegúrate de que ambos puertos estén libres antes de ejecutar.

### MongoDB

El backend espera que MongoDB esté ejecutándose en:
```
mongodb://127.0.0.1:27017/escuela_jose_minero
```

Para iniciar MongoDB localmente:
```bash
mongod
```

## 📚 Documentación Adicional

- **[SCRIPTS.md](SCRIPTS.md)** - Guía completa de los scripts de inicio automatizado, incluyendo solución de problemas y personalización

## 🤝 Contribución

1. Crear una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
2. Hacer commits con mensajes descriptivos
3. Hacer push a la rama: `git push origin feature/nueva-funcionalidad`
4. Crear un Pull Request

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**Desarrollado con ❤️ para la gestión escolar moderna**
