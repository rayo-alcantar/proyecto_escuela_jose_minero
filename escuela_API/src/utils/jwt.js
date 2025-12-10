/**
 * Helper para generación y verificación de JWT.
 * Centraliza la configuración y evita repetir lógica
 * en los controladores y middlewares.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (user) =>
  jwt.sign(
    {
      sub: user._id,
      role: user.role,
      email: user.email,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  );

const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = {
  generateToken,
  verifyToken,
};
