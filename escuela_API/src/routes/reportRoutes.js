/**
 * Rutas para reportes agregados.
 * Prefijo: /api/reports
 */
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const reportController = require('../controllers/reportController');

const router = express.Router();
const staffRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];

router.use(authMiddleware, roleMiddleware(...staffRoles));

router.get('/attendance-summary', reportController.attendanceSummary);
router.get('/grades-summary', reportController.gradesSummary);
router.get('/participation-summary', reportController.participationSummary);

module.exports = router;
