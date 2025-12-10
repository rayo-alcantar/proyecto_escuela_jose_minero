/**
 * Servicio centralizado para comunicación con la API del backend.
 * Maneja todas las peticiones HTTP con configuración base y manejo de errores.
 */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Obtiene el token de autenticación del localStorage
 */
const getAuthToken = () => {
    return localStorage.getItem('token');
};

/**
 * Método genérico para hacer peticiones HTTP
 * @param {string} endpoint - Endpoint de la API (sin el /api)
 * @param {object} options - Opciones de fetch
 * @returns {Promise<object>} Respuesta de la API
 */
const request = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    // Agregar token si existe
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

/**
 * Métodos HTTP
 */
const apiService = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),

    post: (endpoint, body) =>
        request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    put: (endpoint, body) =>
        request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    patch: (endpoint, body) =>
        request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export default apiService;
