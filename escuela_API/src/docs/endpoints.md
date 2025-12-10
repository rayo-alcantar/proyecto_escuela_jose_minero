# Documentación general de la API

## Autenticación
| Método | Endpoint | Descripción | Body |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | Genera JWT para usuarios activos. | `{ "email": "", "password": "" }` |
| POST | `/api/auth/register` | Alta de usuarios (solo ADMIN). | `{ "fullName": "", "email": "", "password": "", "role": "ADMIN|DIRECTION|TEACHER" }` |

## Usuarios
| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/users` | Crea usuarios (solo ADMIN/super usuario). |
| GET | `/api/users` | Lista de usuarios (ADMIN). |
| GET | `/api/users/:id` | Detalle de usuario. |
| PUT | `/api/users/:id` | Actualiza perfil, rol o contraseña. |
| DELETE | `/api/users/:id` | Desactiva usuario. |

## Alumnos
| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/students` | Consulta con filtros por status o búsqueda. |
| GET | `/api/students/:id` | Detalle de alumno. |
| POST | `/api/students` | Crea alumno (ADMIN/DIRECTION). |
| PUT | `/api/students/:id` | Actualiza alumno. |
| DELETE | `/api/students/:id` | Marca como inactivo. |

## Grupos y Materias
- `/api/groups`: GET/POST/PUT/DELETE (roles administrativos).
- `/api/subjects`: GET/POST/PUT/DELETE (roles administrativos).

## Inscripciones
- POST `/api/enrollments` (admin/direction)
- GET `/api/enrollments?groupId=&studentId=`
- DELETE `/api/enrollments/:id`

## Asistencia
- POST `/api/attendance` → crea o actualiza el pase diario.
- GET `/api/attendance?groupId=&from=&to=`
- GET `/api/attendance/student/:studentId`

## Tareas
- POST `/api/tasks`
- GET `/api/tasks?groupId=&subjectId=`
- GET `/api/tasks/:id`
- PUT `/api/tasks/:id`
- DELETE `/api/tasks/:id`

## Entregas de tareas
- POST `/api/task-submissions`
- PUT `/api/task-submissions/:id`
- GET `/api/task-submissions?taskId=&studentId=`

## Participación
- POST `/api/participation`
- GET `/api/participation?studentId=&subjectId=&groupId=`

## Calificaciones
- POST `/api/grades`
- GET `/api/grades?studentId=&subjectId=&term=&groupId=`
- PUT `/api/grades/:id`

## Reportes
- GET `/api/reports/attendance-summary?groupId=&from=&to=`
- GET `/api/reports/grades-summary?groupId=&subjectId=`
- GET `/api/reports/participation-summary?groupId=&subjectId=`

## Puesta en marcha
1. Crear archivo `.env` (puede basarse en `.env.example`).
2. Instalar dependencias con `npm install`.
3. Ejecutar `npm run dev` para entorno de desarrollo o `npm start` en producción.
