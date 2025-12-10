/**
 * Alias sencillo para ejecutar la resiembra completa.
 * Ejecuta el mismo flujo que reset-and-seed.js (preserva admin).
 *
 * Ejecutar:
 *   node seed-data.js
 */
const resetAndSeed = require('./reset-and-seed');

resetAndSeed()
  .then(() => {
    console.log('Datos de ejemplo generados correctamente.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error al generar datos:', err);
    process.exit(1);
  });
