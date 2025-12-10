/**
 * Configuración centralizada de variables de entorno.
 * Lee las variables con dotenv, define valores por defecto
 * y exporta un objeto reutilizable para toda la API.
 */
const path = require('path');
const dotenv = require('dotenv');

// Carga el archivo .env si existe; no falla si no está presente.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envConfig = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 4000,
  mongoUri:
    process.env.MONGODB_URI ||
    'mongodb://127.0.0.1:27017/escuela_jose_minero',
  jwtSecret: process.env.JWT_SECRET || 'escuela-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
};

module.exports = envConfig;
