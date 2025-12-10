/**
 * Servicio para gestión de materias.
 * Requiere autenticación y roles STAFF/MANAGEMENT.
 */
import apiService from './apiService';

/**
 * Obtiene todas las materias
 * @param {object} query - Parámetros de consulta opcionales
 * @returns {Promise<object>} Lista de materias
 */
export const getSubjects = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString ? `/api/subjects?${queryString}` : '/api/subjects';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener materias:', error);
        throw error;
    }
};

/**
 * Crea una nueva materia
 * @param {object} subjectData - Datos de la materia
 * @returns {Promise<object>} Materia creada
 */
export const createSubject = async (subjectData) => {
    try {
        return await apiService.post('/api/subjects', subjectData);
    } catch (error) {
        console.error('Error al crear materia:', error);
        throw error;
    }
};

/**
 * Actualiza una materia existente
 * @param {string} id - ID de la materia
 * @param {object} subjectData - Datos actualizados
 * @returns {Promise<object>} Materia actualizada
 */
export const updateSubject = async (id, subjectData) => {
    try {
        return await apiService.put(`/api/subjects/${id}`, subjectData);
    } catch (error) {
        console.error('Error al actualizar materia:', error);
        throw error;
    }
};

/**
 * Elimina una materia
 * @param {string} id - ID de la materia
 * @returns {Promise<object>} Respuesta de la operación
 */
export const deleteSubject = async (id) => {
    try {
        return await apiService.delete(`/api/subjects/${id}`);
    } catch (error) {
        console.error('Error al eliminar materia:', error);
        throw error;
    }
};

const subjectService = {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
};

export default subjectService;
