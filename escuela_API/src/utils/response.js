/**
 * Utilidades para estandarizar las respuestas JSON.
 * Garantiza el formato solicitado por el usuario:
 *  { success: true, data }  y  { success: false, message, details }.
 */
const successResponse = (res, data, message = 'Operación exitosa', status = 200) =>
  res.status(status).json({ success: true, message, data });

const errorResponse = (
  res,
  message = 'Ocurrió un error inesperado',
  status = 500,
  details = null,
) => res.status(status).json({ success: false, message, details });

module.exports = {
  successResponse,
  errorResponse,
};
