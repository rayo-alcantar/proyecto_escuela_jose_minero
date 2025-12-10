/**
 * Controlador de materias.
 * Endpoints:
 *  - GET /api/subjects
 *  - POST /api/subjects
 *  - PUT /api/subjects/:id
 *  - DELETE /api/subjects/:id
 */
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const listSubjects = async (req, res) => {
  try {
    const filters = {};
    if (req.query.gradeLevel) filters.gradeLevel = Number(req.query.gradeLevel);
    if (req.query.active) filters.isActive = req.query.active === 'true';

    const subjects = await Subject.find(filters).populate('teacher', 'fullName email');
    return successResponse(res, subjects);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener las materias', 500, error.message);
  }
};

const createSubject = async (req, res) => {
  try {
    const required = ['name', 'code'];
    const missing = required.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return errorResponse(res, `Campos requeridos: ${missing.join(', ')}`, 400);
    }

    const subject = await Subject.create(req.body);

    await logAudit({
      action: 'SUBJECT_CREATE',
      entity: 'Subject',
      entityId: subject._id.toString(),
      performedBy: req.user?._id,
    });

    return successResponse(res, subject, 'Materia creada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo crear la materia', 500, error.message);
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const subject = await Subject.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!subject) {
      return errorResponse(res, 'Materia no encontrada', 404);
    }

    await logAudit({
      action: 'SUBJECT_UPDATE',
      entity: 'Subject',
      entityId: id,
      performedBy: req.user?._id,
      metadata: req.body,
    });

    return successResponse(res, subject, 'Materia actualizada');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar la materia', 500, error.message);
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const subject = await Subject.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!subject) {
      return errorResponse(res, 'Materia no encontrada', 404);
    }

    await logAudit({
      action: 'SUBJECT_DEACTIVATE',
      entity: 'Subject',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, subject, 'Materia desactivada');
  } catch (error) {
    return errorResponse(res, 'No se pudo eliminar la materia', 500, error.message);
  }
};

module.exports = {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
