# Sistema de gestion escolar (API + frontend)

Monorepo compuesto por dos aplicaciones:
- `escuela_API`: backend REST sobre Node.js, Express y MongoDB.
- `proyecto-escuela`: frontend React que consume la API.

La documentacion se divide en dos partes: **Guia para desarrolladores** y **Manual de usuario**.

---

## Guia para desarrolladores

### Estructura del repositorio
```
escuela_API/         # Backend
  src/
    config/          # Variables de entorno y conexion a MongoDB
    controllers/     # Logica de negocio por modulo
    middlewares/     # Autenticacion y manejo de errores
    models/          # Esquemas de Mongoose
    routes/          # Endpoints agrupados bajo /api
    utils/           # Logger y helpers
  tests/             # Pruebas Jest (mongodb-memory-server)
  package.json

proyecto-escuela/    # Frontend React
  src/
    componentes/     # Pantallas (Login, Dashboard, Asistencia, etc.)
    services/        # Cliente fetch hacia la API
  public/
  package.json

.gitignore
CREAR-USUARIO-ADMIN.md
patch.diff
```

### Requisitos previos
- Node.js 16+ y npm en PATH (`node -v`, `npm -v`).
- MongoDB local accesible en `mongodb://127.0.0.1:27017/escuela_jose_minero`.
- Dos terminales (una para backend y otra para frontend).

Si MongoDB no esta corriendo, el backend no iniciara; arranca `mongod` antes de levantar servicios.

### Configuracion y ejecucion del backend (`escuela_API`)
1) Instalar dependencias:
```
cd escuela_API
npm install
```
2) Crear `.env` desde el ejemplo:
- Windows: `copy .env.example .env`
- Linux/Mac: `cp .env.example .env`

3) Valores recomendados (`escuela_API/.env`):
```
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/escuela_jose_minero
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=8h
```
4) Ejecutar en desarrollo (con recarga):
```
npm run dev
```
5) Verificaciones:
- Health: `http://localhost:4000/health`
- API base: `http://localhost:4000/api`

Produccion simple:
```
npm start
```

### Datos de ejemplo (seed)
Para tener la base lista con usuarios, grupos, materias, tareas, asistencia y calificaciones:
```
cd escuela_API
npm run seed
```
Esto:
- Conecta a `MONGODB_URI`.
- Crea/asegura admin `admin@escuela.com` / `admin123`.
- Limpia colecciones academicas y las repuebla con datos coherentes.
- Agrega usuarios: admin, direccion, maestro1, maestro2.
- Crea grupos (1A, 2B, 3A), materias, alumnos inscritos, tareas, entregas, asistencia, participacion y calificaciones.

Scripts relacionados:
- `node seed-admin.js`: solo (re)crea el usuario admin.
- `node seed-data.js`: alias directo al seed completo.

### Configuracion y ejecucion del frontend (`proyecto-escuela`)
1) Instalar dependencias:
```
cd proyecto-escuela
npm install
```
2) Crear `.env` desde el ejemplo:
- Windows: `copy .env.example .env`
- Linux/Mac: `cp .env.example .env`

3) Valores recomendados (`proyecto-escuela/.env`):
```
REACT_APP_API_URL=http://localhost:4000
```
4) Ejecutar en desarrollo:
```
npm start
```
Se sirve en `http://localhost:3000`.

### Flujo sugerido end-to-end
1) Inicia MongoDB (`mongod`).  
2) Ejecuta `npm run seed` en `escuela_API` (opcional pero recomendado).  
3) Arranca backend con `npm run dev`.  
4) Arranca frontend con `npm start`.  
5) Ingresa al frontend con credenciales de ejemplo (ver Manual de usuario).  

### Arquitectura rapida del backend
- Express 5, Mongoose 8, JWT, bcryptjs, CORS.
- Entrada: `src/server.js` monta `/api`, health check y manejo de errores global.
- Rutas principales:
  - `/auth` (login, registro)
  - `/users`
  - `/students`, `/groups`, `/subjects`, `/enrollments`
  - `/tasks`, `/task-submissions`
  - `/attendance`, `/participation`, `/grades`, `/reports`
- Roles:
  - `ADMIN`: acceso total.
  - `DIRECTION`: gestiona lo academico, no usuarios.
  - `TEACHER`: limitado a sus grupos/materias asignados.
- Pruebas backend:
```
cd escuela_API
npm test
```
(usa mongodb-memory-server, no toca tu base real).

### Arquitectura rapida del frontend
- React 18, React Router, servicios fetch en `src/services`.
- Token JWT guardado en `localStorage`.
- Componentes clave:
  - `Login`: obtiene y guarda el token.
  - `LayoutPrincipal`: protege rutas y muestra menu lateral.
  - `Dashboard`: estadisticas y reporte general.
  - `Asistencia`: resumen por grupo.
  - `TareasCalificaciones`: tareas vs entregas y promedios.
  - `AdminPanel`: gestion de usuarios, alumnos, grupos, materias, inscripciones, tareas, asistencia y calificaciones.
- Scripts:
```
npm start       # dev server
npm run build   # genera build en ./build
npm test        # pruebas de CRA
```

### Solucion de problemas
- Puerto 4000 o 3000 ocupado: libera procesos o ajusta los puertos en `.env` (backend) y `REACT_APP_API_URL` en el frontend.
- MongoDB no conecta: confirma que `mongod` este activo y la URI sea correcta.
- 401 o token invalido: vuelve a iniciar sesion; borra `localStorage` si persiste.
- Cambios en `.env` no se reflejan: reinicia backend y frontend (CRA lee env al arrancar).
- Nodemon no recarga: reinstala dependencias (`npm install` en backend) o usa `npm start`.

---

## Manual de usuario

### Acceso y requisitos
- Navegador moderno (Chrome/Firefox/Edge).
- URL de la aplicacion: `http://localhost:3000` (o la que exponga el despliegue).
- Credenciales de ejemplo (seed):
  - Admin: `admin@escuela.com` / `admin123`
  - Direccion: `direccion@escuela.com` / `direccion123`
  - Docentes: `maestro1@escuela.com` / `maestro123`, `maestro2@escuela.com` / `maestro123`

### Inicio de sesion
1) Abre `http://localhost:3000`.
2) Ingresa correo y contraseña.
3) Si son validos, se guarda un token y accedes al dashboard.

### Navegacion principal
- **Dashboard**: resumen de tareas, alumnos, grupos y materias; boton para generar reporte (se muestra en consola del navegador).
- **Asistencia**: selector de grupo; tabla con asistencias/faltas y porcentaje por alumno.
- **Tareas y calificaciones**: selecciona materia; lista tareas con entregas, calificadas y promedio.
- **Admin Panel**: disponible para admin/direccion/docentes (segun rol) para operar catalogos y registros.

### Flujos basicos en Admin Panel
- **Usuarios (ADMIN/DIRECTION)**: crear, editar rol/password, activar usuarios.
- **Alumnos (ADMIN/DIRECTION)**: crear/editar alumno y estado.
- **Grupos (ADMIN/DIRECTION)**: crear grupo, asignar tutor.
- **Materias (ADMIN/DIRECTION)**: crear materia y asignar docente.
- **Inscripciones (ADMIN/DIRECTION/TEACHER limitado a sus grupos)**: inscribir alumno a grupo.
- **Tareas**: crear y editar (titulo, fecha, estado); docentes limitados a sus grupos/materias.
- **Asistencia**: seleccionar grupo y marcar estatus por alumno; guardar registro diario.
- **Calificar entregas**: filtrar por grupo/materia, seleccionar tarea, asignar estatus, puntaje y feedback por alumno; guardar.

### Reportes y revisiones rapidas
- Dashboard: muestra totales; reporte general aparece en consola del navegador al hacer clic en “Generar reporte”.
- Asistencia: tabla resume asistencias y faltas por alumno del grupo seleccionado.
- Tareas: tabla por materia con entregas, calificadas y promedio.

### Mensajes y errores comunes
- 401/403: token invalido o permisos insuficientes; vuelve a iniciar sesion o usa un rol con mas privilegios.
- Validaciones: campos requeridos vacios o formatos incorrectos mostraran mensajes en pantalla.
- Conexion fallida: confirma que el backend este activo en el puerto configurado y que `REACT_APP_API_URL` sea correcto.

### Buenas practicas para uso diario
- Mantener el rol adecuado para la tarea (por ejemplo, calificar con docente, no con direccion).
- Actualizar el navegador si cambiaste la configuracion del backend o el puerto.
- Regenerar datos con `npm run seed` solo cuando quieras un estado de demo limpio (elimina datos previos).

---

## Notas finales
- No versionar archivos `.env`; usa `.env.example` como plantilla.
- Si cambias la URL/puerto del backend, ajusta `REACT_APP_API_URL` y reinicia el frontend.
- Para crear el admin manualmente puedes seguir `CREAR-USUARIO-ADMIN.md`; para la via rapida usa el seed.

Documento listo para desarrolladores y usuarios finales, con pasos claros para instalar, ejecutar y operar el sistema. 
