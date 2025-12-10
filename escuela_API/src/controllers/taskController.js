/**
 * Controlador de tareas.
 * Endpoints:
 *  - POST /api/tasks
 *  - GET /api/tasks
 *  - GET /api/tasks/:id
 *  - PUT /api/tasks/:id
 *  - DELETE /api/tasks/:id
 */
const mongoose = require('mongoose');
const Task = require('../models/Task');
const { successResponse, errorResponse } = require('../utils/response');
const logAudit = require('../utils/auditLogger');

// Helper para obtener los IDs de los grupos de un profesor
const getTeacherGroupIds = async (teacherId) => {
    const teacherGroups = await mongoose.model('Group').find({ tutor: teacherId }).select('_id');
    return teacherGroups.map(g => g._id);
};

const createTask = async (req, res) => {
  try {
    const { title, groupId, subjectId, dueDate, description, maxScore, status, attachments } = req.body;
    if (!title || !groupId || !subjectId || !dueDate) {
      return errorResponse(res, 'Campos requeridos: title, groupId, subjectId, dueDate', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return errorResponse(res, 'groupId o subjectId inválido', 400);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(groupId);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para crear tareas en este grupo', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const task = await Task.create({
      title,
      description,
      group: groupId,
      subject: subjectId,
      dueDate,
      maxScore,
      status,
      attachments,
      createdBy: req.user._id,
    });

    await logAudit({
      action: 'TASK_CREATE',
      entity: 'Task',
      entityId: task._id.toString(),
      performedBy: req.user._id,
    });

    return successResponse(res, task, 'Tarea creada', 201);
  } catch (error) {
    return errorResponse(res, 'No se pudo crear la tarea', 500, error.message);
  }
};

const listTasks = async (req, res) => {
  try {
    const { groupId, subjectId } = req.query;
    const filters = {};

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const teacherGroupIds = await getTeacherGroupIds(req.user._id);
        if (groupId) {
            if (!mongoose.Types.ObjectId.isValid(groupId) || !teacherGroupIds.some(id => id.equals(groupId))) {
                return errorResponse(res, 'No tiene permisos para ver las tareas de este grupo', 403);
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

    if (subjectId) {
      if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        return errorResponse(res, 'subjectId inválido', 400);
      }
      filters.subject = subjectId;
    }

    const tasks = await Task.find(filters)
      .populate('group', 'name gradeLevel section')
      .populate('subject', 'name code')
      .populate('createdBy', 'fullName');

    return successResponse(res, tasks);
  } catch (error) {
    return errorResponse(res, 'No se pudieron obtener las tareas', 500, error.message);
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const task = await Task.findById(id)
      .populate('group', 'name gradeLevel section')
      .populate('subject', 'name code')
      .populate('createdBy', 'fullName');

    if (!task) {
      return errorResponse(res, 'Tarea no encontrada', 404);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(task.group);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para ver esta tarea', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    return successResponse(res, task);
  } catch (error) {
    return errorResponse(res, 'No se pudo obtener la tarea', 500, error.message);
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const taskToUpdate = await Task.findById(id);
    if (!taskToUpdate) {
        return errorResponse(res, 'Tarea no encontrada', 404);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(taskToUpdate.group);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para actualizar esta tarea', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    // Evitar que se modifiquen campos sensibles
    const { group, subject, createdBy, ...updateData } = req.body;

    const task = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    await logAudit({
      action: 'TASK_UPDATE',
      entity: 'Task',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, task, 'Tarea actualizada');
  } catch (error) {
    return errorResponse(res, 'No se pudo actualizar la tarea', 500, error.message);
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 'Identificador inválido', 400);
    }

    const taskToDelete = await Task.findById(id);
    if (!taskToDelete) {
        return errorResponse(res, 'Tarea no encontrada', 404);
    }

    // --- INICIO DE VERIFICACIÓN DE PERMISOS ---
    if (req.user.role === 'TEACHER') {
        const group = await mongoose.model('Group').findById(taskToDelete.group);
        if (!group || !group.tutor.equals(req.user._id)) {
            return errorResponse(res, 'No tiene permisos para eliminar esta tarea', 403);
        }
    }
    // --- FIN DE VERIFICACIÓN DE PERMISOS ---

    const task = await Task.findByIdAndDelete(id);

    await logAudit({
      action: 'TASK_DELETE',
      entity: 'Task',
      entityId: id,
      performedBy: req.user?._id,
    });

    return successResponse(res, task, 'Tarea eliminada');
  } catch (error) {
    return errorResponse(res, 'No se pudo eliminar la tarea', 500, error.message);
  }
};

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
