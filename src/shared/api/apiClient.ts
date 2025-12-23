import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

/**
 * API Client configurado para consumir o backend Django
 * Implementa autenticação JWT, interceptors e tratamento de erros
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Cria instância do Axios com configurações base
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Interceptor de Request - Adiciona JWT token
 */
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor de Response - Refresh automático de token
 */
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Se erro 401 e ainda não tentou refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');

                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                // Tenta renovar o token
                const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
                    refresh: refreshToken,
                });

                // Salva novo access token
                localStorage.setItem('access_token', data.access);

                // Atualiza header da requisição original
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
                }

                // Retenta a requisição original
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh falhou - limpa tokens e redireciona para login
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');

                // TODO: Dispatch evento de logout ou redirecionar
                window.dispatchEvent(new CustomEvent('auth:logout'));

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Helper para salvar tokens após login
 */
export const setAuthTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
};

/**
 * Helper para limpar tokens
 */
export const clearAuthTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

/**
 * Helper para verificar se usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('access_token');
};

export default apiClient;
