/**
 * Controlador de calificaciones.
 * Endpoints:
 *  - POST /api/grades
 *  - GET /api/grades
 *  - PUT /api/grades/:id
 */
const mongoose = require('mongoose');
const Grade = require('../models/Grade');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const createGrade = async (req, res) => {
  try {
    const { studentId, subjectId, groupId, term, score, maxScore, comments } =
      req.body;
    const ids = [studentId, subjectId, groupId];
    if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return errorResponse(res, 'studentId, subjectId y groupId deben ser válidos', 400);
    }
    if (!term || score === undefined) {
      return errorResponse(res, 'Campos requeridos: term, score', 400);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
      const group = await mongoose.model('Group').findById(groupId);
      if (!group || !group.tutor.equals(req.user._id)) {
        return errorResponse(res, 'No tiene permisos para registrar calificaciones en este grupo', 403);
      }
      const enrollment = await mongoose.model('Enrollment').findOne({ student: studentId, group: groupId, status: 'ACTIVE' });
      if (!enrollment) {
        return errorResponse(res, 'El alumno no está inscrito en este grupo', 400);
      }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const existing = await Grade.findOne({
      student: studentId,
      subject: subjectId,
      term,
    });
    if (existing) {
      return errorResponse(res, 'Ya existe una calificación para ese periodo', 409);
    }

    const grade = await Grade.create({
      student: studentId,
      subject: subjectId,
      group: groupId,
      term,
      score,
      maxScore,
      comments,
      recordedBy: req.user?._id,
    });

    await logAudit({
      action: 'GRADE_CREATE',
      entity: 'Grade',
      entityId: grade._id.toString(),
      performedBy: req.user?._id,
    });

    return successResponse(res, grade, 'Calificación registrada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo registrar la calificación', 500, error.message);
  }
};

const listGrades = async (req, res) => {
  try {
    const filters = {};
    const { studentId, subjectId, groupId, term } = req.query;

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
      const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
      const teacherGroupIds = teacherGroups.map(g => g._id);

      if (groupId) {
        if (!mongoose.Types.ObjectId.isValid(groupId) || !teacherGroupIds.some(id => id.equals(groupId))) {
          return errorResponse(res, 'No tiene permisos para ver las calificaciones de este grupo', 403);
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
    if (subjectId) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return errorResponse(res, 'subjectId inválido', 400);
      }
      filters.subject = subjectId;
    }
    if (term) {
      filters.term = term;
    }

    const grades = await Grade.find(filters)
      .populate('student', 'firstName lastName')
      .populate('subject', 'name code')
      .populate('group', 'name gradeLevel section');

    return successResponse(res, grades);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener las calificaciones', 500, error.message);
  }
};

const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const gradeToUpdate = await Grade.findById(id);
        if (!gradeToUpdate) {
            return errorResponse(res, 'Calificación no encontrada', 404);
        }
        const group = await mongoose.model('Group').findById(gradeToUpdate.group);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para actualizar esta calificación', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    // Evitar que se modifiquen campos sensibles
    const { student, subject, group, term, ...updateData } = req.body;

    const grade = await Grade.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!grade) {
      return errorResponse(res, 'Calificación no encontrada', 404);
    }

    await logAudit({
      action: 'GRADE_UPDATE',
      entity: 'Grade',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, grade, 'Calificación actualizada');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar la calificación', 500, error.message);
  }
};

module.exports = {
  createGrade,
  listGrades,
  updateGrade,
};
