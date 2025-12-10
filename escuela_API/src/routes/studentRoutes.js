/**
 * Rutas para alumnos.
 * Prefijo: /api/students
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const studentController = require('../controllers/studentController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];
const managementRoles = ['ADMIN', 'DIRECTION'];

router.use(authMiddleware);

router.get('/', roleMiddleware(...staffRoles), studentController.listStudents);
router.get('/:id', roleMiddleware(...staffRoles), studentController.getStudent);
router.post('/', roleMiddleware(...managementRoles), studentController.createStudent);
router.put('/:id', roleMiddleware(...managementRoles), studentController.updateStudent);
router.delete('/:id', roleMiddleware(...managementRoles), studentController.deleteStudent);

module.exports = router;
