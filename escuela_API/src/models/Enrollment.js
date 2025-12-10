/**
 * Modelo de inscripciones de alumnos a grupos.
 * Sirve como bitácora histórica y fuente para reportes académicos.
 */
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'WITHDRAWN'],
      default: 'ACTIVE',
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    observations: { type: String, trim: true },
    enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

enrollmentSchema.index({ student: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
