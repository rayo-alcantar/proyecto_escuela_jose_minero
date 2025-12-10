/**
 * Servicio para gestión de inscripciones.
 * Requiere autenticación y roles STAFF/MANAGEMENT.
 */
import apiService from './apiService';

/**
 * Obtiene todas las inscripciones
 * @param {object} query - Parámetros de consulta (student, group, etc.)
 * @returns {Promise<object>} Lista de inscripciones
 */
export const getEnrollments = async (query = {}) => {
    try {
        const normalizedQuery = { ...query };
        if (normalizedQuery.group) {
            normalizedQuery.groupId = normalizedQuery.group;
            delete normalizedQuery.group;
        }
        if (normalizedQuery.student) {
            normalizedQuery.studentId = normalizedQuery.student;
            delete normalizedQuery.student;
        }
        const queryString = new URLSearchParams(normalizedQuery).toString();
        const endpoint = queryString ? `/api/enrollments?${queryString}` : '/api/enrollments';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener inscripciones:', error);
        throw error;
    }
};

/**
 * Crea una nueva inscripción
 * @param {object} enrollmentData - Datos de la inscripción
 * @returns {Promise<object>} Inscripción creada
 */
export const createEnrollment = async (enrollmentData) => {
    try {
        return await apiService.post('/api/enrollments', enrollmentData);
    } catch (error) {
        console.error('Error al crear inscripción:', error);
        throw error;
    }
};

/**
 * Elimina una inscripción
 * @param {string} id - ID de la inscripción
 * @returns {Promise<object>} Respuesta de la operación
 */
export const deleteEnrollment = async (id) => {
    try {
        return await apiService.delete(`/api/enrollments/${id}`);
    } catch (error) {
        console.error('Error al eliminar inscripción:', error);
        throw error;
    }
};

const enrollmentService = {
    getEnrollments,
    createEnrollment,
    deleteEnrollment,
};

export default enrollmentService;
