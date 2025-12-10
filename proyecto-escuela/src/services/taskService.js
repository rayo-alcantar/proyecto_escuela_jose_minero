/**
 * Servicio para gestión de tareas.
 * Requiere autenticación y roles STAFF.
 */
import apiService from './apiService';

/**
 * Obtiene todas las tareas
 * @param {object} query - Parámetros de consulta opcionales (subject, group, etc.)
 * @returns {Promise<object>} Lista de tareas
 */
export const getTasks = async (query = {}) => {
    try {
        const normalizedQuery = { ...query };
        if (normalizedQuery.subject) {
            normalizedQuery.subjectId = normalizedQuery.subject;
            delete normalizedQuery.subject;
        }
        if (normalizedQuery.group) {
            normalizedQuery.groupId = normalizedQuery.group;
            delete normalizedQuery.group;
        }
        const queryString = new URLSearchParams(normalizedQuery).toString();
        const endpoint = queryString ? `/api/tasks?${queryString}` : '/api/tasks';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        throw error;
    }
};

/**
 * Obtiene una tarea por ID
 * @param {string} id - ID de la tarea
 * @returns {Promise<object>} Datos de la tarea
 */
export const getTaskById = async (id) => {
    try {
        return await apiService.get(`/api/tasks/${id}`);
    } catch (error) {
        console.error('Error al obtener tarea:', error);
        throw error;
    }
};

/**
 * Crea una nueva tarea
 * @param {object} taskData - Datos de la tarea
 * @returns {Promise<object>} Tarea creada
 */
export const createTask = async (taskData) => {
    try {
        return await apiService.post('/api/tasks', taskData);
    } catch (error) {
        console.error('Error al crear tarea:', error);
        throw error;
    }
};

/**
 * Actualiza una tarea existente
 * @param {string} id - ID de la tarea
 * @param {object} taskData - Datos actualizados
 * @returns {Promise<object>} Tarea actualizada
 */
export const updateTask = async (id, taskData) => {
    try {
        return await apiService.put(`/api/tasks/${id}`, taskData);
    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        throw error;
    }
};

/**
 * Elimina una tarea
 * @param {string} id - ID de la tarea
 * @returns {Promise<object>} Respuesta de la operación
 */
export const deleteTask = async (id) => {
    try {
        return await apiService.delete(`/api/tasks/${id}`);
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        throw error;
    }
};

const taskService = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
};

export default taskService;
