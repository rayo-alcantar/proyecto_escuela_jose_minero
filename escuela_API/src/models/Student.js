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
      sparse: true,
      set: (val) => {
        if (typeof val !== 'string') return undefined;
        const normalized = val.trim();
        return normalized.length === 0 ? undefined : normalized.toUpperCase();
      },
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
studentSchema.pre('save', function autoCode(next) {
  if (!this.studentCode) {
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    this.studentCode = `STU-${Date.now().toString().slice(-4)}${random}`;
  }
  next();
});

module.exports = mongoose.model('Student', studentSchema);
