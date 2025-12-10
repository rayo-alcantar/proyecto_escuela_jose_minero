/**
 * Servicio para gestión de usuarios.
 * Requiere autenticación y rol ADMIN.
 */
import apiService from './apiService';

/**
 * Obtiene todos los usuarios
 * @returns {Promise<object>} Lista de usuarios
 */
export const getUsers = async () => {
    try {
        return await apiService.get('/api/users');
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

/**
 * Obtiene un usuario por ID
 * @param {string} id - ID del usuario
 * @returns {Promise<object>} Datos del usuario
 */
export const getUserById = async (id) => {
    try {
        return await apiService.get(`/api/users/${id}`);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        throw error;
    }
};

/**
 * Crea un nuevo usuario
 * @param {object} userData - Datos del usuario
 * @returns {Promise<object>} Usuario creado
 */
export const createUser = async (userData) => {
    try {
        return await apiService.post('/api/users', userData);
    } catch (error) {
        console.error('Error al crear usuario:', error);
        throw error;
    }
};

/**
 * Actualiza un usuario existente
 * @param {string} id - ID del usuario
 * @param {object} userData - Datos actualizados
 * @returns {Promise<object>} Usuario actualizado
 */
export const updateUser = async (id, userData) => {
    try {
        return await apiService.put(`/api/users/${id}`, userData);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

/**
 * Elimina un usuario
 * @param {string} id - ID del usuario
 * @returns {Promise<object>} Respuesta de la operación
 */
export const deleteUser = async (id) => {
    try {
        return await apiService.delete(`/api/users/${id}`);
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        throw error;
    }
};

const userService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};

export default userService;
