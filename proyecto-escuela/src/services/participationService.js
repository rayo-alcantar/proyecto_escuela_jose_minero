/**
 * Servicio para gestión de participación en clase.
 * Requiere autenticación y roles STAFF.
 */
import apiService from './apiService';

/**
 * Obtiene registros de participación
 * @param {object} query - Parámetros de consulta (student, subject, date, etc.)
 * @returns {Promise<object>} Lista de registros de participación
 */
export const getParticipation = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString ? `/api/participation?${queryString}` : '/api/participation';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener participación:', error);
        throw error;
    }
};

/**
 * Crea un nuevo registro de participación
 * @param {object} participationData - Datos de participación
 * @returns {Promise<object>} Registro de participación creado
 */
export const createParticipation = async (participationData) => {
    try {
        return await apiService.post('/api/participation', participationData);
    } catch (error) {
        console.error('Error al crear participación:', error);
        throw error;
    }
};

const participationService = {
    getParticipation,
    createParticipation,
};

export default participationService;
