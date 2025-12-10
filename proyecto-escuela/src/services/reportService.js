/**
 * Servicio para obtener reportes agregados.
 * Requiere autenticación y roles STAFF.
 */
import apiService from './apiService';

/**
 * Obtiene resumen de asistencia
 * @param {object} query - Parámetros de consulta (group, dateFrom, dateTo, etc.)
 * @returns {Promise<object>} Resumen de asistencia
 */
export const getAttendanceSummary = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString
            ? `/api/reports/attendance-summary?${queryString}`
            : '/api/reports/attendance-summary';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener resumen de asistencia:', error);
        throw error;
    }
};

/**
 * Obtiene resumen de calificaciones
 * @param {object} query - Parámetros de consulta (group, subject, etc.)
 * @returns {Promise<object>} Resumen de calificaciones
 */
export const getGradesSummary = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString
            ? `/api/reports/grades-summary?${queryString}`
            : '/api/reports/grades-summary';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener resumen de calificaciones:', error);
        throw error;
    }
};

/**
 * Obtiene resumen de participación
 * @param {object} query - Parámetros de consulta (group, subject, student, etc.)
 * @returns {Promise<object>} Resumen de participación
 */
export const getParticipationSummary = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString
            ? `/api/reports/participation-summary?${queryString}`
            : '/api/reports/participation-summary';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener resumen de participación:', error);
        throw error;
    }
};

const reportService = {
    getAttendanceSummary,
    getGradesSummary,
    getParticipationSummary,
};

export default reportService;
