/**
 * Controlador de autenticacion.
 * Endpoints:
 *  - POST /api/auth/register
 *  - POST /api/auth/login
 */
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');
const logger = require('../utils/logger');

// Helper que valida si un hash es Bcrypt para evitar errores de comparacion
const isValidBcryptHash = (hash) => {
  if (typeof hash !== 'string') return false;
  try {
    bcrypt.getRounds(hash);
    return true;
  } catch (error) {
    return false;
  }
};

// Normaliza correos para evitar duplicados por mayusculas, espacios, etc.
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password || !role) {
      return errorResponse(res, 'Todos los campos son obligatorios', 400);
    }

    const allowedRoles = ['ADMIN', 'DIRECTION', 'TEACHER'];
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, 'Rol invalido', 400);
    }

    const normalizedEmail = normalizeEmail(email); // evita duplicados por mayusculas
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return errorResponse(res, 'El correo ya esta registrado', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      passwordHash: hashedPassword, // se almacena solo el hash seguro
      role,
    });

    await logAudit({
      action: 'USER_REGISTER',
      entity: 'User',
      entityId: user._id.toString(),
      performedBy: req.user?._id,
      metadata: { email: user.email, role: user.role },
    });

    return successResponse(res, user, 'Usuario creado', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo registrar el usuario', 500, error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return errorResponse(res, 'Email y contrasena son obligatorios', 400);
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return errorResponse(res, 'Credenciales invalidas', 401);
    }

    if (!user.isActive) {
      return errorResponse(res, 'El usuario esta inactivo', 403);
    }

    if (!user.passwordHash || !isValidBcryptHash(user.passwordHash)) {
      // Registro del incidente para depuracion
      logger.warn('Usuario con passwordHash invalido detectado', {
        userId: user._id,
        email: user.email,
      });
      return errorResponse(
        res,
        'La cuenta tiene un passwordHash invalido, contacte al administrador',
        400,
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      logger.warn('Intento de login con password incorrecto', {
        userId: user._id,
        email: user.email,
      });
      return errorResponse(res, 'Credenciales invalidas', 401);
    }

    // Actualiza última conexión sin validar el documento completo (útil para usuarios legacy)
    await User.findByIdAndUpdate(
      user._id,
      { lastLoginAt: new Date() },
      { runValidators: false },
    );

    const token = generateToken(user);

    await logAudit({
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user._id.toString(),
      performedBy: user._id,
      metadata: { email: user.email },
    });

    return successResponse(
      res,
      {
        token,
        user,
      },
      'Login exitoso',
    );
  } catch (error) {
    return errorResponse(res, 'No se pudo iniciar sesion', 500, error.message);
  }
};

module.exports = {
  register,
  login,
};
