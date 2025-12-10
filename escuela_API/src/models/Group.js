/**
 * Modelo de grupos escolares (grado-sección).
 * Define tutores responsables y metadatos del ciclo escolar.
 */
const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gradeLevel: { type: Number, required: true, min: 1, max: 6 },
    section: { type: String, trim: true },
    schoolYear: { type: String, trim: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

groupSchema.index({ gradeLevel: 1, section: 1, schoolYear: 1 }, { unique: true });

module.exports = mongoose.model('Group', groupSchema);
