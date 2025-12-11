# Sistema de gestion escolar (API + frontend)

Monorepo con dos aplicaciones:
- `escuela_API`: backend REST con Node.js, Express y MongoDB.
- `proyecto-escuela`: frontend React que consume la API.

## Estructura del repositorio

```
escuela_API/         # Backend
  src/
    config/          # Env y conexion a MongoDB
    controllers/     # Logica de negocio por modulo
    middlewares/     # Autenticacion, manejo de errores, etc.
    models/          # Esquemas de Mongoose
    routes/          # Agrupa endpoints bajo /api
    utils/           # Logger y helpers
  tests/             # Pruebas Jest con mongodb-memory-server
  package.json

proyecto-escuela/    # Frontend React
  src/
    componentes/     # Pantallas y vistas (Login, Dashboard, etc.)
    services/        # Cliente fetch hacia la API
  public/
  package.json

.gitignore
CREAR-USUARIO-ADMIN.md
patch.diff           # Cambios previos de referencia (no usado en build)
```

Los scripts start-dev.bat y start-dev.ps1 se eliminaron por inestables; usa los comandos manuales siguientes.

## Requisitos

- Node.js 16+ y npm.
- MongoDB en localhost (por defecto `mongodb://127.0.0.1:27017/escuela_jose_minero`).
- Dos terminales para correr backend y frontend en paralelo.

## Configuracion rapida

1) Backend (`escuela_API`)
```
cd escuela_API
npm install
copy .env.example .env   # En Linux/Mac usa: cp .env.example .env
```
Variables recomendadas (`escuela_API/.env`):
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/escuela_jose_minero
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=8h
```

2) Frontend (`proyecto-escuela`)
```
cd proyecto-escuela
npm install
copy .env.example .env   # En Linux/Mac usa: cp .env.example .env
```
Variables recomendadas (`proyecto-escuela/.env`):
```
REACT_APP_API_URL=http://localhost:4000
```

## Como ejecutar

- Servidor API (puerto 4000):
```
cd escuela_API
npm run dev      # recarga con nodemon
# npm start      # modo produccion simple
```
Health check: `http://localhost:4000/health`  
Base API: `http://localhost:4000/api`

- Frontend (puerto 3000):
```
cd proyecto-escuela
npm start
```
Abre `http://localhost:3000` en el navegador.

## Base de datos y datos de ejemplo

La API usa MongoDB. Para crear la base con datos coherentes usa el seed oficial:
```
cd escuela_API
npm run seed           # Ejecuta reset-and-seed.js
```
Que hace `npm run seed`:
- Conecta a `MONGODB_URI`.
- Conserva o crea el admin `admin@escuela.com` (pass: `admin123`).
- Limpia colecciones de alumnos, grupos, materias, tareas, calificaciones, asistencia, participacion y auditoria.
- Inserta:
  - Usuarios: admin, direccion, maestro1, maestro2.
  - Grupos: 1A, 2B, 3A con tutores.
  - Materias ligadas a docentes.
  - Alumnos y sus inscripciones.
  - Tareas, entregas, asistencia, calificaciones y participacion de ejemplo.

Otros scripts utiles en `escuela_API`:
- `node seed-admin.js`: solo crea/recrea el usuario admin.
- `node seed-data.js`: alias directo a `reset-and-seed.js`.

## Detalles del backend (escuela_API)

- Stack: Express 5, Mongoose 8, JWT, bcryptjs, CORS.
- Punto de entrada: `src/server.js` monta `/api`, maneja errores y expone `/health`.
- Modulos de rutas bajo `/api`:
  - `/auth` login/registro.
  - `/users` gestion de usuarios.
  - `/students`, `/groups`, `/subjects`, `/enrollments`.
  - `/tasks`, `/task-submissions`, `/attendance`, `/participation`, `/grades`, `/reports`.
- Roles incorporados:
  - `ADMIN`: acceso total.
  - `DIRECTION`: gestiona catalogos y academico, no usuarios.
  - `TEACHER`: limitado a sus grupos y materias asignadas.
- Pruebas: `npm test` (usa mongodb-memory-server, sin tocar tu base real).

## Detalles del frontend (proyecto-escuela)

- Stack: React 18 con React Router, fetch nativo y servicios centralizados en `src/services`.
- Flujo:
  - `Login` guarda token JWT en localStorage.
  - `LayoutPrincipal` protege rutas y muestra menu lateral.
  - Vistas principales: `Dashboard` (estadisticas y reportes), `Asistencia` (resumen por grupo), `TareasCalificaciones` (tareas vs entregas), `AdminPanel` (operaciones CRUD completas para usuarios, alumnos, grupos, materias, inscripciones, tareas, asistencia y calificaciones).
- Scripts:
  - `npm start` modo desarrollo.
  - `npm run build` artefacto productivo en `build/`.
  - `npm test` pruebas de CRA.

## Probar inicio a fin

1) Arranca MongoDB en local (`mongod`).
2) Ejecuta el seed del backend.
3) Inicia backend y frontend con los comandos anteriores.
4) Ingresa en `http://localhost:3000` con alguno de estos usuarios:
   - Admin: `admin@escuela.com` / `admin123`
   - Direccion: `direccion@escuela.com` / `direccion123`
   - Docentes: `maestro1@escuela.com` o `maestro2@escuela.com` / `maestro123`

## Notas y archivos utiles

- `CREAR-USUARIO-ADMIN.md`: guia manual para crear el admin si prefieres no usar el seed.
- Los archivos `.env` nunca se versionan; usa los `.env.example` como plantilla.
- Si cambias puertos o `REACT_APP_API_URL`, mantelos alineados entre frontend y backend.

Proyecto listo para publicarse en GitHub con pasos claros de instalacion, ejecucion y carga de datos.
