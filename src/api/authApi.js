import axios from 'axios';

/**
 * Axios instance for authentication API calls.
 * Base URL points to the Spring Boot backend.
 */
const BASE_URL = '/api/auth';

const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Local Email/Password Login ────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * @param {string} email
 * @param {string} password
 * @returns {Promise<AuthResponse>}
 */
export const loginWithEmail = async (email, password) => {
  const response = await authAxios.post('/login', { email, password });
  return response.data;
};

// ── Local Registration ────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * @param {string} fullName
 * @param {string} email
 * @param {string} password
 * @returns {Promise<AuthResponse>}
 */
export const registerWithEmail = async (fullName, email, password) => {
  const response = await authAxios.post('/register', { fullName, email, password });
  return response.data;
};

// ── Google OAuth Login ────────────────────────────────────────────────────────

/**
 * POST /api/auth/google-login
 * @param {string} credential — the raw Google ID token from @react-oauth/google
 * @returns {Promise<AuthResponse>}
 */
export const loginWithGoogle = async (credential) => {
  console.log('[Auth API] Executing POST /google-login with token length:', credential ? credential.length : 0);
  const response = await authAxios.post('/google-login', { credential });
  console.log('[Auth API] POST /google-login completed successfully. Status:', response.status);
  return response.data;
};

// ── Authenticated Axios Instance ──────────────────────────────────────────────

/**
 * Creates an axios instance that automatically attaches the stored JWT.
 * Use this for any API call that requires authentication.
 */
export const createAuthenticatedAxios = () => {
  const instance = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('sparsh_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid → clear auth and redirect to login
        localStorage.removeItem('sparsh_token');
        localStorage.removeItem('sparsh_user');
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};
