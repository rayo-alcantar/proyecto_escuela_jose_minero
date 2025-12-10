/**
 * Modelo de usuarios del sistema (admin, direccion, docentes).
 * Solo persiste hashes de contrasena para mantener la seguridad.
 */
const mongoose = require('mongoose');

const roles = ['ADMIN', 'DIRECTION', 'TEACHER'];

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // passwordHash asegura que solo se guarde la version hasheada de la contrasena
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: roles,
      default: 'TEACHER',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.passwordHash; // evita exponer el hash en respuestas publicas
  return obj;
};

module.exports = mongoose.model('User', userSchema);
