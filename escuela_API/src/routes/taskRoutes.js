/**
 * Rutas de tareas.
 * Prefijo: /api/tasks
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const taskController = require('../controllers/taskController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];

router.use(authMiddleware, roleMiddleware(...staffRoles));

router.post('/', taskController.createTask);
router.get('/', taskController.listTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
