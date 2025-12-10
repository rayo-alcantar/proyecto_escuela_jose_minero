/**
 * Servicio para gestión de asistencia.
 * Requiere autenticación y roles STAFF.
 */
import apiService from './apiService';

/**
 * Obtiene registros de asistencia
 * @param {object} query - Parámetros de consulta (group, date, etc.)
 * @returns {Promise<object>} Lista de registros de asistencia
 */
export const getAttendance = async (query = {}) => {
    try {
        const normalizedQuery = { ...query };
        if (normalizedQuery.group) {
            normalizedQuery.groupId = normalizedQuery.group;
            delete normalizedQuery.group;
        }
        const queryString = new URLSearchParams(normalizedQuery).toString();
        const endpoint = queryString ? `/api/attendance?${queryString}` : '/api/attendance';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener asistencia:', error);
        throw error;
    }
};

/**
 * Guarda un registro de asistencia
 * @param {object} attendanceData - Datos de asistencia
 * @returns {Promise<object>} Registro de asistencia creado
 */
export const saveAttendance = async (attendanceData) => {
    try {
        return await apiService.post('/api/attendance', attendanceData);
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        throw error;
    }
};

/**
 * Obtiene asistencia de un estudiante específico
 * @param {string} studentId - ID del estudiante
 * @param {object} query - Parámetros adicionales opcionales
 * @returns {Promise<object>} Registros de asistencia del estudiante
 */
export const getAttendanceByStudent = async (studentId, query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString
            ? `/api/attendance/student/${studentId}?${queryString}`
            : `/api/attendance/student/${studentId}`;
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener asistencia del estudiante:', error);
        throw error;
    }
};

const attendanceService = {
    getAttendance,
    saveAttendance,
    getAttendanceByStudent,
};

export default attendanceService;
