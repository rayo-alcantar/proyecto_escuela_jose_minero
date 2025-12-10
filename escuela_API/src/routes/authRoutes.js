/**
 * Rutas de autenticación y gestión de tokens.
 * Prefijo: /api/auth
 */
const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/login', authController.login);
router.post(
  '/register',
  authMiddleware,
  roleMiddleware('ADMIN'),
  authController.register,
);

module.exports = router;
