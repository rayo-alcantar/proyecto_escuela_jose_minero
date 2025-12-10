/**
 * Rutas de participación en clase.
 * Prefijo: /api/participation
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const participationController = require('../controllers/participationController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];

router.use(authMiddleware, roleMiddleware(...staffRoles));

router.post('/', participationController.createParticipation);
router.get('/', participationController.listParticipation);

module.exports = router;
