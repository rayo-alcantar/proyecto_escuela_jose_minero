/**
 * Middlewares globales para rutas inexistentes y manejo de errores.
 * Garantizan el formato { success: false, message, details } ante cualquier fallo.
 */
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Ruta ${req.originalUrl} no encontrada`));
};

const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  logger.error('Error procesando petición', {
    status,
    message,
    stack: err.stack,
    details: err.details,
  });

  return res.status(status).json({
    success: false,
    message,
    details: err.details || null,
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
