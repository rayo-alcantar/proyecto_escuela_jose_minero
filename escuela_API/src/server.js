/**
 * Punto de entrada del servidor Express.
 * Inicializa middlewares globales, conecta con MongoDB
 * y expone todos los módulos bajo /api.
 */
const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const connectDatabase = require('./config/database');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorMiddleware');
const logger = require('./utils/logger');

const app = express();

// Configuración de CORS para permitir peticiones desde el frontend React
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
// Parser JSON debe ejecutarse antes de registrar las rutas para asegurar req.body disponible
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) =>
  res.json({ success: true, message: 'API operativa', data: { env: env.env } }),
);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();
  app.listen(env.port, () => {
    logger.info(`Servidor escuchando en http://localhost:${env.port}`);
  });
};

if (env.env !== 'test') {
  startServer();
}

module.exports = app;
