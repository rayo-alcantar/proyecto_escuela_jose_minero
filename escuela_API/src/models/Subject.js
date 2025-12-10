/**
 * Modelo de materias impartidas en la primaria.
 * Permite asociar docentes responsables y grado objetivo.
 */
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    description: { type: String, trim: true },
    gradeLevel: { type: Number, min: 1, max: 6 },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

subjectSchema.index({ gradeLevel: 1 });

module.exports = mongoose.model('Subject', subjectSchema);
