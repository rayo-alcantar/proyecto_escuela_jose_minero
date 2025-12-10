/**
 * Script de resiembra consistente con los modelos reales de la API.
 * - Conserva o crea el usuario admin (admin@escuela.com / admin123)
 * - Limpia el resto de colecciones
 * - Genera datos de ejemplo coherentes con todos los endpoints
 *
 * Ejecutar:
 *   node reset-and-seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./src/config/env');

const User = require('./src/models/User');
const Student = require('./src/models/Student');
const Group = require('./src/models/Group');
const Subject = require('./src/models/Subject');
const Enrollment = require('./src/models/Enrollment');
const Task = require('./src/models/Task');
const TaskSubmission = require('./src/models/TaskSubmission');
const AttendanceRecord = require('./src/models/AttendanceRecord');
const Grade = require('./src/models/Grade');
const ParticipationRecord = require('./src/models/ParticipationRecord');
const AuditLog = require('./src/models/AuditLog');

const SCHOOL_YEAR = '2024-2025';
const DEFAULT_ADMIN_PASSWORD = 'admin123';

const studentsSeed = [
  {
    firstName: 'Juan',
    lastName: 'Lopez',
    studentCode: 'STU-001',
    birthDate: new Date('2014-02-10'),
    gender: 'MALE',
    address: 'Calle Norte 12',
    guardianName: 'Ana Lopez',
    guardianPhone: '555-0101',
  },
  {
    firstName: 'Maria',
    lastName: 'Garcia',
    studentCode: 'STU-002',
    birthDate: new Date('2014-05-21'),
    gender: 'FEMALE',
    address: 'Calle Sur 45',
    guardianName: 'Laura Garcia',
    guardianPhone: '555-0102',
  },
  {
    firstName: 'Luis',
    lastName: 'Hernandez',
    studentCode: 'STU-003',
    birthDate: new Date('2013-11-03'),
    gender: 'MALE',
    address: 'Av. Industrial 23',
    guardianName: 'Jose Hernandez',
    guardianPhone: '555-0103',
  },
  {
    firstName: 'Sofia',
    lastName: 'Martinez',
    studentCode: 'STU-004',
    birthDate: new Date('2014-09-17'),
    gender: 'FEMALE',
    address: 'Av. Central 101',
    guardianName: 'Patricia Martinez',
    guardianPhone: '555-0104',
  },
  {
    firstName: 'Diego',
    lastName: 'Castillo',
    studentCode: 'STU-005',
    birthDate: new Date('2013-07-29'),
    gender: 'MALE',
    address: 'Priv. Encinos 7',
    guardianName: 'Roberto Castillo',
    guardianPhone: '555-0105',
  },
  {
    firstName: 'Valeria',
    lastName: 'Torres',
    studentCode: 'STU-006',
    birthDate: new Date('2013-03-12'),
    gender: 'FEMALE',
    address: 'Calle Robles 4',
    guardianName: 'Claudia Torres',
    guardianPhone: '555-0106',
  },
  {
    firstName: 'Andres',
    lastName: 'Mendez',
    studentCode: 'STU-007',
    birthDate: new Date('2012-12-01'),
    gender: 'MALE',
    address: 'Calle Rio 9',
    guardianName: 'Hector Mendez',
    guardianPhone: '555-0107',
  },
  {
    firstName: 'Elena',
    lastName: 'Ruiz',
    studentCode: 'STU-008',
    birthDate: new Date('2012-08-08'),
    gender: 'FEMALE',
    address: 'Av. Bosques 14',
    guardianName: 'Liliana Ruiz',
    guardianPhone: '555-0108',
  },
  {
    firstName: 'Miguel',
    lastName: 'Flores',
    studentCode: 'STU-009',
    birthDate: new Date('2012-04-25'),
    gender: 'MALE',
    address: 'Av. Maestros 3',
    guardianName: 'Raul Flores',
    guardianPhone: '555-0109',
  },
];

const groupSeed = [
  { name: '1A', gradeLevel: 1, section: 'A', schoolYear: SCHOOL_YEAR, description: 'Primero A' },
  { name: '2B', gradeLevel: 2, section: 'B', schoolYear: SCHOOL_YEAR, description: 'Segundo B' },
  { name: '3A', gradeLevel: 3, section: 'A', schoolYear: SCHOOL_YEAR, description: 'Tercero A' },
];

const subjectSeed = [
  { name: 'Matematicas', code: 'MAT-1', description: 'Numeros y operaciones', gradeLevel: 1 },
  { name: 'Espanol', code: 'ESP-1', description: 'Lectura y escritura', gradeLevel: 1 },
  { name: 'Ciencias', code: 'CIE-2', description: 'Ciencias Naturales', gradeLevel: 2 },
  { name: 'Historia', code: 'HIS-3', description: 'Historia y civica', gradeLevel: 3 },
  { name: 'Artes', code: 'ART-G', description: 'Expresion artistica', gradeLevel: 3 },
];

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const ensureAdminUser = async () => {
  const existing = await User.findOne({ email: 'admin@escuela.com' });
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
  return User.create({
    fullName: 'Administrador Principal',
    email: 'admin@escuela.com',
    passwordHash,
    role: 'ADMIN',
    isActive: true,
  });
};

const upsertUser = async ({ email, fullName, role, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  return User.findOneAndUpdate(
    { email },
    { fullName, role, passwordHash, isActive: true },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const clearData = async () => {
  await Promise.all([
    Student.deleteMany({}),
    Group.deleteMany({}),
    Subject.deleteMany({}),
    Enrollment.deleteMany({}),
    Task.deleteMany({}),
    TaskSubmission.deleteMany({}),
    AttendanceRecord.deleteMany({}),
    Grade.deleteMany({}),
    ParticipationRecord.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
};

const createAttendance = (group, studentIds, recordedBy, daysBack = 3) => {
  const records = [];
  const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'ABSENT', 'LATE'];

  for (let i = 0; i < daysBack; i += 1) {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - i);

    const dayRecords = studentIds.map((studentId, idx) => ({
      student: studentId,
      status: statuses[(i + idx) % statuses.length],
    }));

    records.push({
      group,
      date,
      records: dayRecords,
      recordedBy,
    });
  }

  return records;
};

async function resetAndSeed() {
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log(`Connected to ${env.mongoUri}`);

  const adminUser = await ensureAdminUser();
  const directionUser = await upsertUser({
    email: 'direccion@escuela.com',
    fullName: 'Direccion Escolar',
    role: 'DIRECTION',
    password: 'direccion123',
  });
  const teacherOne = await upsertUser({
    email: 'maestro1@escuela.com',
    fullName: 'Profe Alvarez',
    role: 'TEACHER',
    password: 'maestro123',
  });
  const teacherTwo = await upsertUser({
    email: 'maestro2@escuela.com',
    fullName: 'Profe Ramirez',
    role: 'TEACHER',
    password: 'maestro123',
  });

  await clearData();

  const groups = await Group.insertMany([
    { ...groupSeed[0], tutor: teacherOne._id, isActive: true },
    { ...groupSeed[1], tutor: teacherTwo._id, isActive: true },
    { ...groupSeed[2], tutor: teacherOne._id, isActive: true },
  ]);

  const subjects = await Subject.insertMany([
    { ...subjectSeed[0], teacher: teacherOne._id, isActive: true },
    { ...subjectSeed[1], teacher: teacherOne._id, isActive: true },
    { ...subjectSeed[2], teacher: teacherTwo._id, isActive: true },
    { ...subjectSeed[3], teacher: teacherTwo._id, isActive: true },
    { ...subjectSeed[4], teacher: teacherOne._id, isActive: true },
  ]);

  const students = await Student.insertMany(studentsSeed);

  const enrollments = await Enrollment.insertMany([
    // Grupo 1A
    { student: students[0]._id, group: groups[0]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    { student: students[1]._id, group: groups[0]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    { student: students[2]._id, group: groups[0]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    // Grupo 2B
    { student: students[3]._id, group: groups[1]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    { student: students[4]._id, group: groups[1]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    { student: students[5]._id, group: groups[1]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    // Grupo 3A
    { student: students[6]._id, group: groups[2]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    { student: students[7]._id, group: groups[2]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
    { student: students[8]._id, group: groups[2]._id, status: 'ACTIVE', enrolledBy: adminUser._id },
  ]);

  const tasks = await Task.insertMany([
    {
      title: 'Sumas y restas basicas',
      description: 'Resolver 10 ejercicios del cuaderno',
      group: groups[0]._id,
      subject: subjects[0]._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      status: 'ASSIGNED',
      createdBy: teacherOne._id,
    },
    {
      title: 'Lectura guiada',
      description: 'Leer el cuento asignado y responder 5 preguntas',
      group: groups[0]._id,
      subject: subjects[1]._id,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      status: 'ASSIGNED',
      createdBy: teacherOne._id,
    },
    {
      title: 'Proyecto de ciencias',
      description: 'Construir una maqueta simple sobre el ciclo del agua',
      group: groups[1]._id,
      subject: subjects[2]._id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      status: 'ASSIGNED',
      createdBy: teacherTwo._id,
    },
    {
      title: 'Linea del tiempo',
      description: 'Elaborar linea del tiempo de la independencia',
      group: groups[2]._id,
      subject: subjects[3]._id,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      maxScore: 100,
      status: 'ASSIGNED',
      createdBy: teacherTwo._id,
    },
  ]);

  const studentsByGroup = enrollments.reduce((acc, enrollment) => {
    const key = enrollment.group.toString();
    acc[key] = acc[key] || [];
    acc[key].push(enrollment.student);
    return acc;
  }, {});

  const attendancePayload = [
    ...createAttendance(groups[0]._id, studentsByGroup[groups[0]._id.toString()] || [], teacherOne._id),
    ...createAttendance(groups[1]._id, studentsByGroup[groups[1]._id.toString()] || [], teacherTwo._id),
    ...createAttendance(groups[2]._id, studentsByGroup[groups[2]._id.toString()] || [], teacherTwo._id),
  ];
  await AttendanceRecord.insertMany(attendancePayload);

  await TaskSubmission.insertMany([
    {
      task: tasks[0]._id,
      student: students[0]._id,
      submittedAt: new Date(),
      content: 'Ejercicios resueltos en cuaderno',
      status: 'GRADED',
      score: 95,
      feedback: 'Buen trabajo',
      gradedBy: teacherOne._id,
    },
    {
      task: tasks[0]._id,
      student: students[1]._id,
      submittedAt: new Date(),
      content: 'Fotos del cuaderno',
      status: 'GRADED',
      score: 88,
      feedback: 'Revisar el ejercicio 4',
      gradedBy: teacherOne._id,
    },
    {
      task: tasks[2]._id,
      student: students[4]._id,
      submittedAt: new Date(),
      content: 'Maqueta y resumen',
      status: 'GRADED',
      score: 92,
      feedback: 'Excelente explicacion',
      gradedBy: teacherTwo._id,
    },
  ]);

  await Grade.insertMany([
    {
      student: students[0]._id,
      group: groups[0]._id,
      subject: subjects[0]._id,
      term: 'BIM1',
      score: 93,
      maxScore: 100,
      comments: 'Progreso constante',
      recordedBy: teacherOne._id,
    },
    {
      student: students[1]._id,
      group: groups[0]._id,
      subject: subjects[1]._id,
      term: 'BIM1',
      score: 87,
      maxScore: 100,
      comments: 'Mejorar fluidez lectora',
      recordedBy: teacherOne._id,
    },
    {
      student: students[4]._id,
      group: groups[1]._id,
      subject: subjects[2]._id,
      term: 'BIM1',
      score: 90,
      maxScore: 100,
      comments: 'Buen trabajo en equipo',
      recordedBy: teacherTwo._id,
    },
  ]);

  await ParticipationRecord.insertMany([
    {
      student: students[2]._id,
      subject: subjects[0]._id,
      group: groups[0]._id,
      score: 85,
      notes: 'Participa en clase',
      recordedBy: teacherOne._id,
      date: startOfDay(new Date()),
    },
    {
      student: students[4]._id,
      subject: subjects[2]._id,
      group: groups[1]._id,
      score: 92,
      notes: 'Aporta ideas en laboratorio',
      recordedBy: teacherTwo._id,
      date: startOfDay(new Date()),
    },
    {
      student: students[7]._id,
      subject: subjects[3]._id,
      group: groups[2]._id,
      score: 88,
      notes: 'Hace buenas preguntas',
      recordedBy: teacherTwo._id,
      date: startOfDay(new Date()),
    },
  ]);

  console.log('\nBase de datos reseteada y poblada con datos de prueba:');
  console.log(`- Admin: ${adminUser.email}`);
  console.log(`- Direccion: ${directionUser.email}`);
  console.log(`- Docentes: ${teacherOne.email}, ${teacherTwo.email}`);
  console.log(`- Grupos creados: ${groups.length}`);
  console.log(`- Materias creadas: ${subjects.length}`);
  console.log(`- Estudiantes creados: ${students.length}`);
  console.log(`- Inscripciones creadas: ${enrollments.length}`);
  console.log(`- Tareas creadas: ${tasks.length}`);
  console.log(`- Registros de asistencia: ${attendancePayload.length}`);
  console.log('- Calificaciones y participacion creadas.');

  await mongoose.disconnect();
}

if (require.main === module) {
  resetAndSeed()
    .then(() => {
      console.log('\nListo. Puedes iniciar el backend y probar con estos datos.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error al ejecutar el seed:', err);
      process.exit(1);
    });
}

module.exports = resetAndSeed;
