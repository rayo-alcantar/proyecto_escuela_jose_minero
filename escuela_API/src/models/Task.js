/**
 * Modelo de tareas asignadas a grupos o materias.
 * Incluye fechas límite y responsables para seguimiento.
 */
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    dueDate: { type: Date, required: true },
    maxScore: { type: Number, default: 100 },
    status: {
      type: String,
      enum: ['ASSIGNED', 'CLOSED'],
      default: 'ASSIGNED',
    },
    attachments: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ group: 1, subject: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
