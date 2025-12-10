/**
 * Rutas para gestión de grupos.
 * Prefijo: /api/groups
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const groupController = require('../controllers/groupController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];
const managementRoles = ['ADMIN', 'DIRECTION'];

router.use(authMiddleware);

router.get('/', roleMiddleware(...staffRoles), groupController.listGroups);
router.post('/', roleMiddleware(...managementRoles), groupController.createGroup);
router.put('/:id', roleMiddleware(...managementRoles), groupController.updateGroup);
router.delete('/:id', roleMiddleware(...managementRoles), groupController.deleteGroup);

module.exports = router;
