/**
 * Controlador de reportes agregados.
 * Endpoints:
 *  - GET /api/reports/attendance-summary
 *  - GET /api/reports/grades-summary
 *  - GET /api/reports/participation-summary
 */
const mongoose = require('mongoose');
const AttendanceRecord = require('../models/AttendanceRecord');
const Grade = require('../models/Grade');
const ParticipationRecord = require('../models/ParticipationRecord');
const { successResponse, errorResponse } = require('../utils/response');

const attendanceSummary = async (req, res) => {
  try {
    const { groupId, from, to } = req.query;
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return errorResponse(res, 'groupId es obligatorio y debe ser válido', 400);
    }

    const filters = { group: groupId };
    if (from || to) {
      filters.date = {};
      if (from) filters.date.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        filters.date.$lte = toDate;
      }
    }

    const records = await AttendanceRecord.find(filters).populate(
      'records.student',
      'firstName lastName',
    );

    const summary = {};
    records.forEach((entry) => {
      entry.records.forEach((record) => {
        const student = record.student;
        if (!student) return;
        const key = student._id.toString();
        if (!summary[key]) {
          summary[key] = {
            student,
            PRESENT: 0,
            ABSENT: 0,
            LATE: 0,
            EXCUSED: 0,
            total: 0,
          };
        }
        summary[key][record.status] += 1;
        summary[key].total += 1;
      });
    });

    return successResponse(res, Object.values(summary));
  } catch (error) {
    return errorResponse(res, 'No se pudo generar el resumen de asistencia', 500, error.message);
  }
};

const gradesSummary = async (req, res) => {
  try {
    const { groupId, subjectId } = req.query;
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return errorResponse(res, 'groupId es obligatorio y debe ser válido', 400);
    }
    if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) {
      return errorResponse(res, 'subjectId inválido', 400);
    }

    const filters = { group: groupId };
    if (subjectId) filters.subject = subjectId;

    const grades = await Grade.find(filters).populate('student', 'firstName lastName');

    const summary = {};
    grades.forEach((grade) => {
      if (!grade.student) return;
      const key = grade.student._id.toString();
      if (!summary[key]) {
        summary[key] = {
          student: grade.student,
          average: 0,
          total: 0,
        };
      }
      const normalized = (grade.score / (grade.maxScore || 100)) * 100;
      summary[key].average += normalized;
      summary[key].total += 1;
    });

    const formatted = Object.values(summary).map((item) => ({
      student: item.student,
      average: item.total ? Number((item.average / item.total).toFixed(2)) : 0,
      records: item.total,
    }));

    return successResponse(res, formatted);
  } catch (error) {
    return errorResponse(res, 'No se pudo generar el resumen de calificaciones', 500, error.message);
  }
};

const participationSummary = async (req, res) => {
  try {
    const { groupId, subjectId } = req.query;
    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return errorResponse(res, 'groupId es obligatorio y debe ser válido', 400);
    }
    if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) {
      return errorResponse(res, 'subjectId inválido', 400);
    }

    const filters = { group: groupId };
    if (subjectId) filters.subject = subjectId;

    const participation = await ParticipationRecord.find(filters).populate(
      'student',
      'firstName lastName',
    );

    const summary = {};
    participation.forEach((record) => {
      if (!record.student) return;
      const key = record.student._id.toString();
      if (!summary[key]) {
        summary[key] = {
          student: record.student,
          totalScore: 0,
          count: 0,
        };
      }
      summary[key].totalScore += record.score || 0;
      summary[key].count += 1;
    });

    const formatted = Object.values(summary).map((item) => ({
      student: item.student,
      average: item.count ? Number((item.totalScore / item.count).toFixed(2)) : 0,
      records: item.count,
    }));

    return successResponse(res, formatted);
  } catch (error) {
    return errorResponse(res, 'No se pudo generar el resumen de participación', 500, error.message);
  }
};

module.exports = {
  attendanceSummary,
  gradesSummary,
  participationSummary,
};
