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

    const response = await fetch(`${API_URL}${endpoint}`, config);
    let data = null;
    try {
        data = await response.json();
    } catch (_err) {
        data = null;
    }

    if (!response.ok) {
        const error = new Error((data && data.message) || 'Error en la petición');
        error.status = response.status;
        error.details = data;
        throw error;
    }

    return data;
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
