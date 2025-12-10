/**
 * Rutas para entregas de tareas.
 * Prefijo: /api/task-submissions
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const taskSubmissionController = require('../controllers/taskSubmissionController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];

// Endpoint público para que los alumnos puedan crear entregas.
// La validación de que el alumno pertenece al grupo se hace en el controlador.
router.post('/', taskSubmissionController.createSubmission);

// Endpoints protegidos para que el personal pueda listar y calificar entregas.
router.get('/', authMiddleware, roleMiddleware(...staffRoles), taskSubmissionController.listSubmissions);
router.put('/:id', authMiddleware, roleMiddleware(...staffRoles), taskSubmissionController.updateSubmission);


module.exports = router;
