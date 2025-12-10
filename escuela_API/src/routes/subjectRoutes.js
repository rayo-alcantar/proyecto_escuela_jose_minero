/**
 * Rutas para materias.
 * Prefijo: /api/subjects
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const subjectController = require('../controllers/subjectController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];
const managementRoles = ['ADMIN', 'DIRECTION'];

router.use(authMiddleware);

router.get('/', roleMiddleware(...staffRoles), subjectController.listSubjects);
router.post('/', roleMiddleware(...managementRoles), subjectController.createSubject);
router.put('/:id', roleMiddleware(...managementRoles), subjectController.updateSubject);
router.delete('/:id', roleMiddleware(...managementRoles), subjectController.deleteSubject);

module.exports = router;
