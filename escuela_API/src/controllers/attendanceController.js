/**
 * Controlador de asistencia.
 * Endpoints:
 *  - POST /api/attendance
 *  - GET /api/attendance
 *  - GET /api/attendance/student/:studentId
 */
const mongoose = require('mongoose');
const AttendanceRecord = require('../models/AttendanceRecord');
const Enrollment = require('../models/Enrollment');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const normalizeDate = (dateString) => {
  const date = dateString ? new Date(dateString) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const saveAttendance = async (req, res) => {
  try {
    const { groupId, date, records = [] } = req.body;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return errorResponse(res, 'groupId inválido', 400);
    }
    if (!Array.isArray(records) || records.length === 0) {
      return errorResponse(res, 'Debe enviar al menos un registro de asistencia', 400);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(groupId);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para registrar asistencia en este grupo', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const studentIds = records.map(r => r.studentId);
    const enrollments = await Enrollment.find({ group: groupId, student: { $in: studentIds }, status: 'ACTIVE' }).select('student');
    const enrolledStudentIds = new Set(enrollments.map(e => e.student.toString()));

    const formattedRecords = [];
    for (const item of records) {
      if (!mongoose.Types.ObjectId.isValid(item.studentId)) {
        return errorResponse(res, `studentId inválido en records: ${item.studentId}`, 400);
      }
      if (!enrolledStudentIds.has(item.studentId)) {
        return errorResponse(res, `El alumno ${item.studentId} no está inscrito en este grupo.`, 400);
      }
      formattedRecords.push({
        student: item.studentId,
        status: item.status || 'PRESENT',
        remarks: item.remarks,
      });
    }

    const targetDate = normalizeDate(date);
    const attendance = await AttendanceRecord.findOneAndUpdate(
      { group: groupId, date: targetDate },
      {
        group: groupId,
        date: targetDate,
        records: formattedRecords,
        recordedBy: req.user._id,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );

    await logAudit({
      action: 'ATTENDANCE_SAVE',
      entity: 'AttendanceRecord',
      entityId: attendance._id.toString(),
      performedBy: req.user._id,
    });

    return successResponse(res, attendance, 'Asistencia registrada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo guardar la asistencia', 500, error.message);
  }
};

const listAttendance = async (req, res) => {
  try {
    const { groupId, from, to } = req.query;
    const filters = {};

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
        const teacherGroupIds = teacherGroups.map(g => g._id);
        if (groupId) {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !teacherGroupIds.some(id => id.equals(groupId))) {
                return errorResponse(res, 'No tiene permisos para ver la asistencia de este grupo', 403);
            }
            filters.group = groupId;
        } else {
            filters.group = { $in: teacherGroupIds };
        }
    } else {
        if (groupId) {
            if (!mongoose.Types.ObjectId.isValid(groupId)) {
                return errorResponse(res, 'groupId inválido', 400);
            }
            filters.group = groupId;
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    if (from || to) {
      filters.date = {};
      if (from) filters.date.$gte = normalizeDate(from);
      if (to) {
        const toDate = normalizeDate(to);
        toDate.setHours(23, 59, 59, 999);
        filters.date.$lte = toDate;
      }
    }

    const attendance = await AttendanceRecord.find(filters)
      .populate('group', 'name gradeLevel section')
      .populate('records.student', 'firstName lastName');

    return successResponse(res, attendance);
  } catch (error) {
    return errorResponse(res, 'No se pudo obtener la asistencia', 500, error.message);
  }
};

const attendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse(res, 'studentId inválido', 400);
    }

    const filters = { 'records.student': studentId };

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
        const teacherGroupIds = teacherGroups.map(g => g._id);
        filters.group = { $in: teacherGroupIds };
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const records = await AttendanceRecord.find(filters)
      .populate('group', 'name gradeLevel section')
      .lean();

    const filtered = records.map((item) => ({
      _id: item._id,
      group: item.group,
      date: item.date,
      entry: item.records.find(
        (record) => record.student.toString() === studentId,
      ),
    }));

    return successResponse(res, filtered);
  } catch (error) {
    return errorResponse(res, 'No se pudo obtener la asistencia del alumno', 500, error.message);
  }
};

module.exports = {
  saveAttendance,
  listAttendance,
  attendanceByStudent,
};
