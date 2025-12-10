# Escuela API REST

Backend para la gestión académica, construido con Node.js, Express y MongoDB.

---

## Tecnologías

- Node.js, Express, Mongoose
- Autenticación: JWT (`jsonwebtoken`)
- Hashing: `bcryptjs`

---

## Instalación y Ejecución

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```
2.  **Configurar entorno:** Copia `.env.example` a `.env` y ajusta las variables.
    ```bash
    cp .env.example .env
    ```
3.  **Ejecutar servidor:**
    - Desarrollo: `npm run dev`
    - Producción: `npm start`

---

## API Conventions

- **URL Base**: `http://localhost:4000/api`
- **Autenticación**: Enviar token JWT en la cabecera `Authorization: Bearer <token>`.
- **Respuestas**:
  - Éxito: `{ "success": true, "message": "...", "data": ... }`
  - Error: `{ "success": false, "message": "...", "details": "..." }`

---

## Gestión de Permisos por Rol

El sistema opera con tres roles con capacidades estrictamente definidas.

###  Rol `ADMIN` (Super Usuario)
Tiene control total sobre el sistema.
- **Usuarios**: CRUD completo de usuarios (`/api/users`). Puede crear, ver, actualizar y desactivar cualquier usuario, incluyendo otros `ADMIN`.
- **Académico**: Acceso sin restricciones a todos los módulos (alumnos, grupos, materias, etc.).

### Rol `DIRECTION` (Director)
Tiene control sobre la organización académica, pero no sobre la administración del sistema.
- **Usuarios**: **No puede** gestionar usuarios.
- **Académico**: CRUD completo sobre alumnos, grupos, materias e inscripciones.
- **Supervisión**: Puede ver toda la información académica (calificaciones, asistencia, etc.) de cualquier grupo o alumno.

### Rol `TEACHER` (Maestro)
Sus permisos están **restringidos únicamente a los grupos que tiene asignados como tutor**. El campo `tutor` en el modelo `Group` define esta propiedad.
- **Gestión de su(s) grupo(s)**:
  - **Alumnos**: Puede listar y ver el detalle **solo** de los alumnos inscritos en sus grupos.
  - **Calificaciones, Tareas, Asistencia, Participación**: Puede crear, leer y actualizar registros **solo** para los alumnos y grupos que le corresponden.
- **Visibilidad Limitada**: No puede ver ni modificar información de grupos, alumnos o registros que no le pertenecen. Por ejemplo, `GET /api/grades?groupId=<ID_OTRO_GRUPO>` devolverá un error 403 (Prohibido).
- **Creación de Recursos**: Al crear una tarea o un registro de asistencia, el `groupId` proporcionado **debe** corresponder a un grupo donde es tutor.

---

## Endpoints Principales

| Módulo | Endpoints | Acceso General | Notas |
| --- | --- | --- | --- |
| **Autenticación** | `POST /auth/login`, `POST /auth/register` | Público / ADMIN | `register` es solo para `ADMIN`. |
| **Usuarios** | `/users` | `ADMIN` | CRUD completo de usuarios. |
| **Alumnos** | `/students` | `ADMIN`, `DIRECTION`, `TEACHER` | Creación/modificación para `ADMIN`/`DIRECTION`. `TEACHER` solo puede ver alumnos de sus grupos. |
| **Grupos** | `/groups` | `ADMIN`, `DIRECTION`, `TEACHER` | Creación/modificación para `ADMIN`/`DIRECTION`. `TEACHER` solo puede listar. |
| **Materias** | `/subjects` | `ADMIN`, `DIRECTION`, `TEACHER` | Creación/modificación para `ADMIN`/`DIRECTION`. `TEACHER` solo puede listar. |
| **Inscripciones** | `/enrollments` | `ADMIN`, `DIRECTION`, `TEACHER` | Creación/modificación para `ADMIN`/`DIRECTION`. `TEACHER` solo puede ver inscripciones de sus grupos. |
| **Calificaciones** | `/grades` | `ADMIN`, `DIRECTION`, `TEACHER` | `TEACHER` solo puede gestionar calificaciones de sus grupos. |
| **Asistencia** | `/attendance` | `ADMIN`, `DIRECTION`, `TEACHER` | `TEACHER` solo puede gestionar la asistencia de sus grupos. |
| **Tareas** | `/tasks` | `ADMIN`, `DIRECTION`, `TEACHER` | `TEACHER` solo puede gestionar tareas de sus grupos. |
| **Entregas** | `/task-submissions` | Público / Staff | `POST` es público (para alumnos). `GET`/`PUT` para `TEACHER` (calificar) restringido a sus grupos. |
| **Participación** | `/participation` | `ADMIN`, `DIRECTION`, `TEACHER` | `TEACHER` solo puede gestionar la participación de sus grupos. |
| **Reportes** | `/reports` | `ADMIN`, `DIRECTION`, `TEACHER` | Los reportes para `TEACHER` están filtrados por sus grupos. |

---

## Códigos de Error Comunes

- `200/201`: Éxito.
- `400`: Petición inválida (ej. campos faltantes, ID con formato incorrecto).
- `401`: No autenticado (token ausente o inválido).
- `403`: Prohibido (rol insuficiente o intento de acceso a recursos ajenos).
- `404`: Recurso no encontrado.
- `409`: Conflicto (ej. recurso duplicado).
- `500`: Error interno del servidor.

## Datos de prueba

- Ejecuta `npm run seed` dentro de `escuela_API` para limpiar las colecciones (se conserva/crea el admin) y poblar datos coherentes con los modelos actuales.
- Usuarios de ejemplo:
  - admin@escuela.com / admin123
  - direccion@escuela.com / direccion123
  - maestro1@escuela.com / maestro123
  - maestro2@escuela.com / maestro123
