/**
 * Rutas de calificaciones.
 * Prefijo: /api/grades
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const gradeController = require('../controllers/gradeController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];

router.use(authMiddleware, roleMiddleware(...staffRoles));

router.post('/', gradeController.createGrade);
router.get('/', gradeController.listGrades);
router.put('/:id', gradeController.updateGrade);

module.exports = router;
