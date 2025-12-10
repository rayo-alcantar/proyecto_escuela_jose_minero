/**
 * Modelo de alumnos inscritos en la primaria.
 * Centraliza datos personales, tutor y estado académico.
 */
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    studentCode: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
    },
    birthDate: { type: Date },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
    },
    address: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'GRADUATED'],
      default: 'ACTIVE',
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

studentSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Student', studentSchema);
