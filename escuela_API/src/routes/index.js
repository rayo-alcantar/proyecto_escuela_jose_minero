/**
 * Registro central de rutas de la API.
 * Se monta en /api desde el servidor principal.
 */
const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const studentRoutes = require('./studentRoutes');
const groupRoutes = require('./groupRoutes');
const subjectRoutes = require('./subjectRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const attendanceRoutes = require('./attendanceRoutes');
const taskRoutes = require('./taskRoutes');
const taskSubmissionRoutes = require('./taskSubmissionRoutes');
const participationRoutes = require('./participationRoutes');
const gradeRoutes = require('./gradeRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

// Endpoint base para confirmar que la API está viva
router.get('/', (req, res) =>
  res.json({
    success: true,
    message: 'API Escuela operativa',
    data: { version: '1.0.0' },
  }),
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/students', studentRoutes);
router.use('/groups', groupRoutes);
router.use('/subjects', subjectRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/tasks', taskRoutes);
router.use('/task-submissions', taskSubmissionRoutes);
router.use('/participation', participationRoutes);
router.use('/grades', gradeRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
