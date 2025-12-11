/**
 * Controlador de alumnos.
 * Endpoints:
 *  - GET /api/students
 *  - GET /api/students/:id
 *  - POST /api/students
 *  - PUT /api/students/:id
 *  - DELETE /api/students/:id
 */
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Enrollment = require('../models/Enrollment');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const generateStudentCode = () => {
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `STU-${Date.now().toString().slice(-4)}${random}`;
};

const listStudents = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filters = {};
    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { studentCode: { $regex: search, $options: 'i' } },
      ];
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
      const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
      const teacherGroupIds = teacherGroups.map((g) => g._id);

      const enrollments = await Enrollment.find({ group: { $in: teacherGroupIds }, status: 'ACTIVE' }).select('student');
      const studentIds = enrollments.map((e) => e.student);

      filters._id = { $in: studentIds };
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const students = await Student.find(filters).sort({ lastName: 1 });
    return successResponse(res, students);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener los alumnos', 500, error.message);
  }
};

const getStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const student = await Student.findById(id);
    if (!student) {
      return errorResponse(res, 'Alumno no encontrado', 404);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
      const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
      const teacherGroupIds = teacherGroups.map((g) => g._id);

      const enrollment = await Enrollment.findOne({
        student: id,
        group: { $in: teacherGroupIds },
        status: 'ACTIVE',
      });
      if (!enrollment) {
        return errorResponse(res, 'No tiene permisos para ver a este alumno', 403);
      }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    return successResponse(res, student);
  } catch (error) {
    return errorResponse(res, 'No se pudo obtener el alumno', 500, error.message);
  }
};

const createStudent = async (req, res) => {
  try {
    const required = ['firstName', 'lastName'];
    const missing = required.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return errorResponse(res, `Campos requeridos: ${missing.join(', ')}`, 400);
    }

    const payload = { ...req.body };
    if (!payload.studentCode || String(payload.studentCode).trim() === '') {
      payload.studentCode = generateStudentCode();
    }

    const student = await Student.create(payload);

    await logAudit({
      action: 'STUDENT_CREATE',
      entity: 'Student',
      entityId: student._id.toString(),
      performedBy: req.user?._id,
    });

    return successResponse(res, student, 'Alumno creado', 201);
  } catch (error) {
    if (error?.code === 11000) {
      return errorResponse(res, 'El código de alumno ya existe', 409, error.message);
    }
    return errorResponse(res, 'No se pudo crear el alumno', 500, error.message);
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const student = await Student.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return errorResponse(res, 'Alumno no encontrado', 404);
    }

    await logAudit({
      action: 'STUDENT_UPDATE',
      entity: 'Student',
      entityId: id,
      performedBy: req.user?._id,
      metadata: req.body,
    });

    return successResponse(res, student, 'Alumno actualizado');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar el alumno', 500, error.message);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const student = await Student.findByIdAndUpdate(
      id,
      { status: 'INACTIVE' },
      { new: true },
    );

    if (!student) {
      return errorResponse(res, 'Alumno no encontrado', 404);
    }

    await logAudit({
      action: 'STUDENT_DEACTIVATE',
      entity: 'Student',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, student, 'Alumno desactivado');
  } catch (error) {
    return errorResponse(res, 'No se pudo eliminar el alumno', 500, error.message);
  }
};

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};
