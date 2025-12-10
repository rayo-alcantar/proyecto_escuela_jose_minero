/**
 * Controlador para administrar usuarios del sistema.
 * Endpoints cubiertos:
 *  - POST /api/users
 *  - GET /api/users
 *  - GET /api/users/:id
 *  - PUT /api/users/:id
 *  - DELETE /api/users/:id (soft delete)
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const createUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    if (!fullName || !email || !password || !role) {
      return errorResponse(res, 'fullName, email, password y role son obligatorios', 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return errorResponse(res, 'El correo ya esta registrado', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      passwordHash,
      role,
      isActive: true,
    });

    await logAudit({
      action: 'USER_CREATE_ADMIN',
      entity: 'User',
      entityId: user._id.toString(),
      performedBy: req.user?._id,
      metadata: { email: user.email, role: user.role },
    });

    return successResponse(res, user, 'Usuario creado', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo crear el usuario', 500, error.message);
  }
};

const buildUserFilters = (query) => {
  const filters = {};
  if (query.role) {
    filters.role = query.role;
  }
  if (query.active !== undefined) {
    filters.isActive = query.active === 'true';
  }
  if (query.search) {
    filters.fullName = { $regex: query.search, $options: 'i' };
  }
  return filters;
};

const getUsers = async (req, res) => {
  try {
    const filters = buildUserFilters(req.query);
    const users = await User.find(filters).sort({ fullName: 1 });
    return successResponse(res, users);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener los usuarios', 500, error.message);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, 'No se pudo obtener el usuario', 500, error.message);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, role, isActive, password } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const updatePayload = {};
    if (fullName) updatePayload.fullName = fullName;
    if (role) {
      const allowedRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];
      if (!allowedRoles.includes(role)) {
        return errorResponse(res, 'Rol inválido', 400);
      }
      updatePayload.role = role;
    }
    if (typeof isActive === 'boolean') updatePayload.isActive = isActive;
    if (password) {
      // Se mantiene consistencia usando el campo passwordHash tambien desde el panel de admin
      updatePayload.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    await logAudit({
      action: 'USER_UPDATE',
      entity: 'User',
      entityId: id,
      performedBy: req.user?._id,
      metadata: updatePayload,
    });

    return successResponse(res, user, 'Usuario actualizado');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar el usuario', 500, error.message);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!user) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    await logAudit({
      action: 'USER_DEACTIVATE',
      entity: 'User',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, user, 'Usuario desactivado');
  } catch (error) {
    return errorResponse(res, 'No se pudo desactivar el usuario', 500, error.message);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
