/**
 * Controlador de entregas de tareas.
 * Endpoints:
 *  - POST /api/task-submissions
 *  - PUT /api/task-submissions/:id
 *  - GET /api/task-submissions
 */
const mongoose = require('mongoose');
const TaskSubmission = require('../models/TaskSubmission');
const Task = require('../models/Task');
const Enrollment = require('../models/Enrollment');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

const createSubmission = async (req, res) => {
  try {
    const { taskId, studentId, content, attachments = [] } = req.body;
    if (!mongoose.Types.ObjectId.isValid(taskId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return errorResponse(res, 'taskId y studentId deben ser válidos', 400);
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return errorResponse(res, 'Tarea no encontrada', 404);
    }

    // Validar que el alumno esté inscrito en el grupo de la tarea
    const enrollment = await Enrollment.findOne({ student: studentId, group: task.group, status: 'ACTIVE' });
    if (!enrollment) {
        return errorResponse(res, 'El alumno no pertenece al grupo de esta tarea', 403);
    }

    const existing = await TaskSubmission.findOne({ task: taskId, student: studentId });
    if (existing) {
      return errorResponse(res, 'Ya existe una entrega para esta tarea', 409);
    }

    const submission = await TaskSubmission.create({
      task: taskId,
      student: studentId,
      content,
      attachments,
      status: 'SUBMITTED',
    });

    // El performedBy no se puede determinar si el endpoint es público
    await logAudit({
      action: 'TASK_SUBMISSION_CREATE',
      entity: 'TaskSubmission',
      entityId: submission._id.toString(),
      metadata: { studentId, taskId },
    });

    return successResponse(res, submission, 'Entrega registrada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo registrar la entrega', 500, error.message);
  }
};

const updateSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const submissionToUpdate = await TaskSubmission.findById(id).populate('task');
    if (!submissionToUpdate) {
        return errorResponse(res, 'Entrega no encontrada', 404);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(submissionToUpdate.task.group);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para calificar esta entrega', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const { score, feedback, status } = req.body;
    const updatePayload = { gradedBy: req.user._id };
    if (score !== undefined) updatePayload.score = score;
    if (feedback !== undefined) updatePayload.feedback = feedback;
    
    // Solo el personal puede cambiar el estado, y si se califica, se marca como GRADED
    if (status) {
        updatePayload.status = status;
    } else if (score !== undefined) {
        updatePayload.status = 'GRADED';
    }

    const submission = await TaskSubmission.findByIdAndUpdate(id, updatePayload, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      action: 'TASK_SUBMISSION_UPDATE',
      entity: 'TaskSubmission',
      entityId: id,
      performedBy: req.user._id,
    });

    return successResponse(res, submission, 'Entrega actualizada');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar la entrega', 500, error.message);
  }
};

const listSubmissions = async (req, res) => {
  try {
    const { taskId, studentId } = req.query;
    const filters = {};

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const teacherGroups = await mongoose.model('Group').find({ tutor: req.user._id }).select('_id');
        const teacherGroupIds = teacherGroups.map(g => g._id);
        
        const tasks = await Task.find({ group: { $in: teacherGroupIds } }).select('_id');
        const teacherTaskIds = tasks.map(t => t._id);

        if (taskId) {
            if (!mongoose.Types.ObjectId.isValid(taskId) || !teacherTaskIds.some(id => id.equals(taskId))) {
                return errorResponse(res, 'No tiene permisos para ver las entregas de esta tarea', 403);
            }
            filters.task = taskId;
        } else {
            filters.task = { $in: teacherTaskIds };
        }
    } else {
        if (taskId) {
            if (!mongoose.Types.ObjectId.isValid(taskId)) {
                return errorResponse(res, 'taskId inválido', 400);
            }
            filters.task = taskId;
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return errorResponse(res, 'studentId inválido', 400);
      }
      filters.student = studentId;
    }

    const submissions = await TaskSubmission.find(filters)
      .populate('student', 'firstName lastName')
      .populate('task', 'title');

    return successResponse(res, submissions);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener las entregas', 500, error.message);
  }
};

module.exports = {
  createSubmission,
  updateSubmission,
  listSubmissions,
};
