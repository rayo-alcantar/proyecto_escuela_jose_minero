/**
 * Modelo que guarda la asistencia diaria por grupo.
 * Permite almacenar el detalle por alumno y generar reportes.
 */
const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    records: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Student',
          required: true,
        },
        status: {
          type: String,
          enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
          default: 'PRESENT',
        },
        remarks: { type: String, trim: true },
      },
    ],
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

attendanceRecordSchema.index({ group: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);
