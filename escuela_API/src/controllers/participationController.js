/**
 * Controlador de participación en clase.
 * Endpoints:
 *  - POST /api/participation
 *  - GET /api/participation
 */
const mongoose = require('mongoose');
const ParticipationRecord = require('../models/ParticipationRecord');
const Enrollment = require('../models/Enrollment');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const createParticipation = async (req, res) => {
  try {
    const { studentId, subjectId, groupId, score, notes } = req.body;
    const ids = [studentId, subjectId, groupId];
    if (ids.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
      return errorResponse(res, 'studentId, subjectId y groupId deben ser válidos', 400);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(groupId);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para registrar participación en este grupo', 403);
        }
        const enrollment = await Enrollment.findOne({ student: studentId, group: groupId, status: 'ACTIVE' });
        if (!enrollment) {
            return errorResponse(res, 'El alumno no está inscrito en este grupo', 400);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const participation = await ParticipationRecord.create({
      student: studentId,
      subject: subjectId,
      group: groupId,
      score,
      notes,
      recordedBy: req.user._id,
    });

    await logAudit({
      action: 'PARTICIPATION_CREATE',
      entity: 'ParticipationRecord',
      entityId: participation._id.toString(),
      performedBy: req.user._id,
    });

    return successResponse(res, participation, 'Participación registrada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo registrar la participación', 500, error.message);
  }
};

const listParticipation = async (req, res) => {
  try {
    const filters = {};
    const { studentId, subjectId, groupId } = req.query;

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
        const teacherGroupIds = teacherGroups.map(g => g._id);
        if (groupId) {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !teacherGroupIds.some(id => id.equals(groupId))) {
                return errorResponse(res, 'No tiene permisos para ver la participación de este grupo', 403);
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

    const participation = await ParticipationRecord.find(filters)
      .populate('student', 'firstName lastName')
      .populate('subject', 'name code')
      .populate('group', 'name gradeLevel section');

    return successResponse(res, participation);
  } catch (error) {
    return errorResponse(res, 'No se pudo obtener la participación', 500, error.message);
  }
};

module.exports = {
  createParticipation,
  listParticipation,
};
