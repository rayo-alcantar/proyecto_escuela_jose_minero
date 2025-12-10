/**
 * Modelo de entregas de tareas por alumno.
 * Se usa tanto para evidencias como para calificaciones específicas.
 */
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    content: { type: String, trim: true },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ['SUBMITTED', 'GRADED', 'MISSING'],
      default: 'SUBMITTED',
    },
    score: { type: Number },
    feedback: { type: String, trim: true },
    gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
  },
);

submissionSchema.index({ task: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('TaskSubmission', submissionSchema);
