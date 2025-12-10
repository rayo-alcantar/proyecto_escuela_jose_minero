/**
 * Configuración y helper de conexión a MongoDB usando Mongoose.
 * Expone una función `connectDatabase` que asegura la conexión
 * y registra eventos útiles para monitoreo de disponibilidad.
 */
const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

const connectDatabase = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri, {
      autoIndex: true,
    });
    logger.info('Conexión a MongoDB establecida');
  } catch (error) {
    logger.error('Error al conectar con MongoDB', { error });
    process.exit(1);
  }
};

module.exports = connectDatabase;
