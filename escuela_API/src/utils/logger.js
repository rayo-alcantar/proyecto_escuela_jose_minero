/**
 * Logger mínimo para la API.
 * Estandariza los mensajes y permite adjuntar metadatos
 * sin acoplarse a librerías externas.
 */
const formatPayload = (payload) =>
  payload ? JSON.stringify(payload, null, 2) : '';

const log = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    console.log(`${base} -> ${formatPayload(meta)}`);
  } else {
    console.log(base);
  }
};

module.exports = {
  info: (message, meta) => log('info', message, meta),
  warn: (message, meta) => log('warn', message, meta),
  error: (message, meta) => log('error', message, meta),
};
