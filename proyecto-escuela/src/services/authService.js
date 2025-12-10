/**
 * Servicio de autenticación.
 * Maneja login, logout y verificación de sesión.
 */
import apiService from './apiService';

/**
 * Realiza el login del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<object>} Datos del usuario y token
 */
export const login = async (email, password) => {
    try {
        const response = await apiService.post('/api/auth/login', {
            email,
            password,
        });

        // Guardar token en localStorage
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

/**
 * Cierra la sesión del usuario
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
    return !!localStorage.getItem('token');
};

/**
 * Obtiene el usuario actual del localStorage
 * @returns {object|null}
 */
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const authService = {
    login,
    logout,
    isAuthenticated,
    getCurrentUser,
};

export default authService;
