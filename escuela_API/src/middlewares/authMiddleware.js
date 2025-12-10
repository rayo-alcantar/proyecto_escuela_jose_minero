/**
 * Middleware de autenticacion JWT.
 * Valida el token Bearer, recupera al usuario y lo adjunta a req.user.
 * Respuestas de error siguen el formato requerido por el proyecto.
 */
const User = require('../models/User');
const { errorResponse } = require('../utils/response');
const { verifyToken } = require('../utils/jwt'); // reutiliza helper centralizado

const authMiddleware = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return errorResponse(res, 'Token no proporcionado', 401);
  }

  try {
    const token = authorization.split(' ')[1];
    const decoded = verifyToken(token); // asegura misma configuracion JWT en toda la app
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      return errorResponse(res, 'Usuario no autorizado', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return errorResponse(res, 'Token invalido o expirado', 401, error.message);
  }
};

module.exports = authMiddleware;
