/**
 * Servicio para gestión de estudiantes.
 * Requiere autenticación y roles STAFF/MANAGEMENT.
 */
import apiService from './apiService';

/**
 * Obtiene todos los estudiantes
 * @param {object} query - Parámetros de consulta opcionales
 * @returns {Promise<object>} Lista de estudiantes
 */
export const getStudents = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString ? `/api/students?${queryString}` : '/api/students';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener estudiantes:', error);
        throw error;
    }
};

/**
 * Obtiene un estudiante por ID
 * @param {string} id - ID del estudiante
 * @returns {Promise<object>} Datos del estudiante
 */
export const getStudentById = async (id) => {
    try {
        return await apiService.get(`/api/students/${id}`);
    } catch (error) {
        console.error('Error al obtener estudiante:', error);
        throw error;
    }
};

/**
 * Crea un nuevo estudiante
 * @param {object} studentData - Datos del estudiante
 * @returns {Promise<object>} Estudiante creado
 */
export const createStudent = async (studentData) => {
    try {
        return await apiService.post('/api/students', studentData);
    } catch (error) {
        console.error('Error al crear estudiante:', error);
        throw error;
    }
};

/**
 * Actualiza un estudiante existente
 * @param {string} id - ID del estudiante
 * @param {object} studentData - Datos actualizados
 * @returns {Promise<object>} Estudiante actualizado
 */
export const updateStudent = async (id, studentData) => {
    try {
        return await apiService.put(`/api/students/${id}`, studentData);
    } catch (error) {
        console.error('Error al actualizar estudiante:', error);
        throw error;
    }
};

/**
 * Elimina un estudiante
 * @param {string} id - ID del estudiante
 * @returns {Promise<object>} Respuesta de la operación
 */
export const deleteStudent = async (id) => {
    try {
        return await apiService.delete(`/api/students/${id}`);
    } catch (error) {
        console.error('Error al eliminar estudiante:', error);
        throw error;
    }
};

const studentService = {
    getStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
};

export default studentService;
