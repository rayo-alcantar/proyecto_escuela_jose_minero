/**
 * Servicio para gestión de entregas de tareas.
 * Algunos endpoints requieren autenticación STAFF.
 */
import apiService from './apiService';

/**
 * Obtiene todas las entregas de tareas
 * @param {object} query - Parámetros de consulta opcionales (task, student, etc.)
 * @returns {Promise<object>} Lista de entregas
 */
export const getSubmissions = async (query = {}) => {
    try {
        const normalizedQuery = { ...query };
        if (normalizedQuery.task) {
            normalizedQuery.taskId = normalizedQuery.task;
            delete normalizedQuery.task;
        }
        if (normalizedQuery.student) {
            normalizedQuery.studentId = normalizedQuery.student;
            delete normalizedQuery.student;
        }
        if (normalizedQuery.group) {
            normalizedQuery.groupId = normalizedQuery.group;
            delete normalizedQuery.group;
        }
        const queryString = new URLSearchParams(normalizedQuery).toString();
        const endpoint = queryString ? `/api/task-submissions?${queryString}` : '/api/task-submissions';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener entregas:', error);
        throw error;
    }
};

/**
 * Crea una nueva entrega de tarea
 * @param {object} submissionData - Datos de la entrega
 * @returns {Promise<object>} Entrega creada
 */
export const createSubmission = async (submissionData) => {
    try {
        return await apiService.post('/api/task-submissions', submissionData);
    } catch (error) {
        console.error('Error al crear entrega:', error);
        throw error;
    }
};

/**
 * Actualiza una entrega de tarea (calificar, comentarios)
 * @param {string} id - ID de la entrega
 * @param {object} submissionData - Datos actualizados
 * @returns {Promise<object>} Entrega actualizada
 */
export const updateSubmission = async (id, submissionData) => {
    try {
        return await apiService.put(`/api/task-submissions/${id}`, submissionData);
    } catch (error) {
        console.error('Error al actualizar entrega:', error);
        throw error;
    }
};

const taskSubmissionService = {
    getSubmissions,
    createSubmission,
    updateSubmission,
};

export default taskSubmissionService;
