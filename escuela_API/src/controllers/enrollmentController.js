/**
 * Controlador de inscripciones.
 * Endpoints:
 *  - POST /api/enrollments
 *  - GET /api/enrollments
 *  - DELETE /api/enrollments/:id
 */
const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Student = require('../models/Student');
const Group = require('../models/Group');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const createEnrollment = async (req, res) => {
  try {
    const { studentId, groupId, status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(groupId)) {
      return errorResponse(res, 'studentId y groupId deben ser válidos', 400);
    }

    const [student, group] = await Promise.all([
      Student.findById(studentId),
      Group.findById(groupId),
    ]);
    if (!student || !group) {
      return errorResponse(res, 'Alumno o grupo no encontrado', 404);
    }
    if (student.status !== 'ACTIVE' || !group.isActive) {
        return errorResponse(res, 'El alumno o el grupo no están activos', 400);
    }

    const existing = await Enrollment.findOne({ student: studentId, group: groupId });
    if (existing) {
      return errorResponse(res, 'El alumno ya está inscrito en este grupo', 409);
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      group: groupId,
      status: status || 'ACTIVE',
      enrolledBy: req.user?._id,
    });

    await logAudit({
      action: 'ENROLLMENT_CREATE',
      entity: 'Enrollment',
      entityId: enrollment._id.toString(),
      performedBy: req.user?._id,
      metadata: { studentId, groupId },
    });

    return successResponse(res, enrollment, 'Inscripción registrada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo registrar la inscripción', 500, error.message);
  }
};

const listEnrollments = async (req, res) => {
  try {
    const filters = {};
    const { groupId, studentId, status } = req.query;

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
        const teacherGroupIds = teacherGroups.map(g => g._id);
        if (groupId) {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !teacherGroupIds.some(id => id.equals(groupId))) {
                return errorResponse(res, 'No tiene permisos para ver las inscripciones de este grupo', 403);
            }
            filters.group = groupId;
        } else {
            filters.group = { $in: teacherGroupIds };
        }
    } else {
        if (groupId) {
            if (!mongoose.Types.ObjectId.isValid(groupId)) {
                return errorResponse(res, 'groupId inválido', 400);
            }
            filters.group = groupId;
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return errorResponse(res, 'studentId inválido', 400);
      }
      filters.student = studentId;
    }
    if (status) {
      filters.status = status;
    }

    const enrollments = await Enrollment.find(filters)
      .populate('student', 'firstName lastName status')
      .populate('group', 'name gradeLevel');

    return successResponse(res, enrollments);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener las inscripciones', 500, error.message);
  }
};

const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const enrollment = await Enrollment.findByIdAndDelete(id);
    if (!enrollment) {
      return errorResponse(res, 'Inscripción no encontrada', 404);
    }

    await logAudit({
      action: 'ENROLLMENT_DELETE',
      entity: 'Enrollment',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, enrollment, 'Inscripción eliminada');
  } catch (error) {
    return errorResponse(res, 'No se pudo eliminar la inscripción', 500, error.message);
  }
};

module.exports = {
  createEnrollment,
  listEnrollments,
  deleteEnrollment,
};
