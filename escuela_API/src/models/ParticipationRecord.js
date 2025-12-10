/**
 * Registro de participación diaria / semanal para evaluaciones formativas.
 * Permite generar reportes por alumno y materia.
 */
const mongoose = require('mongoose');

const participationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    notes: { type: String, trim: true },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

participationSchema.index({ student: 1, subject: 1, date: 1 });

module.exports = mongoose.model('ParticipationRecord', participationSchema);
