/**
 * Rutas para inscripciones.
 * Prefijo: /api/enrollments
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];
const managementRoles = ['ADMIN', 'DIRECTION'];

router.use(authMiddleware);

router.get('/', roleMiddleware(...staffRoles), enrollmentController.listEnrollments);
router.post('/', roleMiddleware(...managementRoles), enrollmentController.createEnrollment);
router.delete('/:id', roleMiddleware(...managementRoles), enrollmentController.deleteEnrollment);

module.exports = router;
