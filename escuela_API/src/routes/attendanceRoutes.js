/**
 * Rutas de asistencia.
 * Prefijo: /api/attendance
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const attendanceController = require('../controllers/attendanceController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];

router.use(authMiddleware, roleMiddleware(...staffRoles));

router.post('/', attendanceController.saveAttendance);
router.get('/', attendanceController.listAttendance);
router.get('/student/:studentId', attendanceController.attendanceByStudent);

module.exports = router;
