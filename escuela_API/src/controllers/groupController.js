/**
 * Controlador de grupos escolares.
 * Endpoints:
 *  - GET /api/groups
 *  - POST /api/groups
 *  - PUT /api/groups/:id
 *  - DELETE /api/groups/:id
 */
const mongoose = require('mongoose');
const Group = require('../models/Group');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const listGroups = async (req, res) => {
  try {
    const filters = {};
    if (req.query.gradeLevel) filters.gradeLevel = Number(req.query.gradeLevel);
    if (req.query.schoolYear) filters.schoolYear = req.query.schoolYear;
    if (req.query.active) filters.isActive = req.query.active === 'true';

    const groups = await Group.find(filters).populate('tutor', 'fullName email');
    return successResponse(res, groups);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener los grupos', 500, error.message);
  }
};

const createGroup = async (req, res) => {
  try {
    const required = ['name', 'gradeLevel', 'schoolYear'];
    const missing = required.filter((field) => !req.body[field]);
    if (missing.length > 0) {
      return errorResponse(res, `Campos requeridos: ${missing.join(', ')}`, 400);
    }

    const group = await Group.create(req.body);

    await logAudit({
      action: 'GROUP_CREATE',
      entity: 'Group',
      entityId: group._id.toString(),
      performedBy: req.user?._id,
    });

    return successResponse(res, group, 'Grupo creado', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo crear el grupo', 500, error.message);
  }
};

const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const group = await Group.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) {
      return errorResponse(res, 'Grupo no encontrado', 404);
    }

    await logAudit({
      action: 'GROUP_UPDATE',
      entity: 'Group',
      entityId: id,
      performedBy: req.user?._id,
      metadata: req.body,
    });

    return successResponse(res, group, 'Grupo actualizado');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar el grupo', 500, error.message);
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const group = await Group.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!group) {
      return errorResponse(res, 'Grupo no encontrado', 404);
    }

    await logAudit({
      action: 'GROUP_DEACTIVATE',
      entity: 'Group',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, group, 'Grupo desactivado');
  } catch (error) {
    return errorResponse(res, 'No se pudo eliminar el grupo', 500, error.message);
  }
};

module.exports = {
  listGroups,
  createGroup,
  updateGroup,
  deleteGroup,
};
