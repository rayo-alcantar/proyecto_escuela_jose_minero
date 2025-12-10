/**
 * Middleware de autorización por roles.
 * Recibe un listado de roles permitidos y detiene la petición
 * si el usuario autenticado no los cumple.
 */
const { errorResponse } = require('../utils/response');

const roleMiddleware = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Usuario no autenticado', 401);
  }

  if (!allowedRoles.includes(req.user.role)) {
    return errorResponse(res, 'No cuenta con permisos suficientes', 403);
  }

  return next();
};

module.exports = roleMiddleware;
