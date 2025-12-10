/**
 * Servicio para gestión de calificaciones.
 * Requiere autenticación y roles STAFF.
 */
import apiService from './apiService';

/**
 * Obtiene todas las calificaciones
 * @param {object} query - Parámetros de consulta (student, subject, etc.)
 * @returns {Promise<object>} Lista de calificaciones
 */
export const getGrades = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString ? `/api/grades?${queryString}` : '/api/grades';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener calificaciones:', error);
        throw error;
    }
};

/**
 * Crea una nueva calificación
 * @param {object} gradeData - Datos de la calificación
 * @returns {Promise<object>} Calificación creada
 */
export const createGrade = async (gradeData) => {
    try {
        return await apiService.post('/api/grades', gradeData);
    } catch (error) {
        console.error('Error al crear calificación:', error);
        throw error;
    }
};

/**
 * Actualiza una calificación existente
 * @param {string} id - ID de la calificación
 * @param {object} gradeData - Datos actualizados
 * @returns {Promise<object>} Calificación actualizada
 */
export const updateGrade = async (id, gradeData) => {
    try {
        return await apiService.put(`/api/grades/${id}`, gradeData);
    } catch (error) {
        console.error('Error al actualizar calificación:', error);
        throw error;
    }
};

const gradeService = {
    getGrades,
    createGrade,
    updateGrade,
};

export default gradeService;
