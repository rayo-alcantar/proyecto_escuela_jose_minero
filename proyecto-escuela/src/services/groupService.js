/**
 * Servicio para gestión de grupos.
 * Requiere autenticación y roles STAFF/MANAGEMENT.
 */
import apiService from './apiService';

/**
 * Obtiene todos los grupos
 * @param {object} query - Parámetros de consulta opcionales
 * @returns {Promise<object>} Lista de grupos
 */
export const getGroups = async (query = {}) => {
    try {
        const queryString = new URLSearchParams(query).toString();
        const endpoint = queryString ? `/api/groups?${queryString}` : '/api/groups';
        return await apiService.get(endpoint);
    } catch (error) {
        console.error('Error al obtener grupos:', error);
        throw error;
    }
};

/**
 * Crea un nuevo grupo
 * @param {object} groupData - Datos del grupo
 * @returns {Promise<object>} Grupo creado
 */
export const createGroup = async (groupData) => {
    try {
        return await apiService.post('/api/groups', groupData);
    } catch (error) {
        console.error('Error al crear grupo:', error);
        throw error;
    }
};

/**
 * Actualiza un grupo existente
 * @param {string} id - ID del grupo
 * @param {object} groupData - Datos actualizados
 * @returns {Promise<object>} Grupo actualizado
 */
export const updateGroup = async (id, groupData) => {
    try {
        return await apiService.put(`/api/groups/${id}`, groupData);
    } catch (error) {
        console.error('Error al actualizar grupo:', error);
        throw error;
    }
};

/**
 * Elimina un grupo
 * @param {string} id - ID del grupo
 * @returns {Promise<object>} Respuesta de la operación
 */
export const deleteGroup = async (id) => {
    try {
        return await apiService.delete(`/api/groups/${id}`);
    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        throw error;
    }
};

const groupService = {
    getGroups,
    createGroup,
    updateGroup,
    deleteGroup,
};

export default groupService;
