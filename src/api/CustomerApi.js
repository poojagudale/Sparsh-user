/**
 * CustomerApi.js
 *
 * All customer-related API calls against the Spring Boot backend.
 * Base URL: /api/customers (proxied to Spring Boot by Vite in development)
 *
 * Endpoint types:
 *   - /me endpoints  → JWT-protected, email enforced by backend from JWT
 *   - Other endpoints → public (legacy admin CRUD, kept intact)
 */

const BASE_URL = '/api/customers';

// ── Helpers ────────────────────────────────────────────────────────

/**
 * Normalises the fName / lName casing that the Java backend may return
 * as capitalised property names (FName / LName) on some JVM versions.
 */
const normaliseCustomer = (data) => ({
  ...data,
  fName: data.fName || data.FName || '',
  lName: data.lName || data.LName || '',
});

/** Builds fetch options, always attaching the JWT when available. */
const requestOptions = (options = {}) => {
  const token = localStorage.getItem('sparsh_token');
  return {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
};

// ── Self-service (JWT-protected) /me endpoints ─────────────────────

/**
 * GET /api/customers/me
 * Fetches the Customer record for the currently authenticated user (email from JWT).
 * Returns the Customer object if found, or null on 404.
 * Throws on network / server errors (5xx).
 */
export const getMyCustomerProfile = async () => {
  try {
    const res = await fetch(`${BASE_URL}/me`, requestOptions());

    if (res.status === 404) return null;
    if (res.status === 401) {
      // Token expired — clear auth state and redirect
      localStorage.removeItem('sparsh_token');
      localStorage.removeItem('sparsh_user');
      window.location.href = '/login';
      return null;
    }
    if (!res.ok) {
      throw new Error(`Server error fetching profile (${res.status})`);
    }

    return normaliseCustomer(await res.json());
  } catch (err) {
    console.error('getMyCustomerProfile error:', err);
    throw err;
  }
};

/**
 * POST /api/customers/me
 * Creates a new Customer profile for the authenticated user.
 * The backend overrides the email field using the JWT — body email is ignored.
 * Returns the created Customer object.
 * Throws on network / server / validation errors.
 */
export const createMyCustomerProfile = async (data) => {
  const res = await fetch(`${BASE_URL}/me`, requestOptions({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));

  if (res.status === 401) {
    localStorage.removeItem('sparsh_token');
    localStorage.removeItem('sparsh_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (!res.ok) {
    let msg = `Failed to create profile (${res.status})`;
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch {
      msg = (await res.text()) || msg;
    }
    throw new Error(msg);
  }

  return normaliseCustomer(await res.json());
};

/**
 * PUT /api/customers/me/{id}
 * Updates the authenticated user's Customer profile.
 * Backend enforces ownership — id must belong to the JWT email's customer.
 * Returns the updated Customer object.
 */
export const updateMyCustomerProfile = async (id, data) => {
  const res = await fetch(`${BASE_URL}/me/${id}`, requestOptions({
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));

  if (res.status === 401) {
    localStorage.removeItem('sparsh_token');
    localStorage.removeItem('sparsh_user');
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }
  if (res.status === 403) {
    throw new Error('You do not have permission to update this profile.');
  }
  if (!res.ok) {
    let msg = `Failed to update profile (${res.status})`;
    try {
      const err = await res.json();
      msg = err.message || err.error || msg;
    } catch {
      msg = (await res.text()) || msg;
    }
    throw new Error(msg);
  }

  return normaliseCustomer(await res.json());
};

// ── Legacy public read endpoints ────────────────────────────────────

export const getAllCustomers = async () => {
  const res = await fetch(BASE_URL, requestOptions());
  if (!res.ok) throw new Error(`Failed to fetch customers (${res.status})`);
  return res.json();
};

export const getCustomerById = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, requestOptions());
  if (!res.ok) throw new Error(`Customer not found (${res.status})`);
  return normaliseCustomer(await res.json());
};

/**
 * Search a customer by mobile number.
 * Returns the customer object if found, or null if not found (404).
 * Throws on network / server errors (5xx) so callers can show an error state.
 */
export const getCustomerByMobile = async (mobile) => {
  try {
    const res = await fetch(`${BASE_URL}/mobile/${encodeURIComponent(mobile)}`, requestOptions());

    if (res.status === 404) return null;

    if (!res.ok) {
      throw new Error(`Server error while searching (${res.status})`);
    }

    return normaliseCustomer(await res.json());
  } catch (err) {
    // Re-throw network errors (TypeError: Failed to fetch, etc.)
    console.error('getCustomerByMobile error:', err);
    throw err;
  }
};

/**
 * Fetch customer by email (public endpoint — used by admin or legacy flows).
 * Returns null on 404, throws on server errors.
 */
export const getCustomerByEmail = async (email) => {
  try {
    const res = await fetch(`${BASE_URL}/email/${encodeURIComponent(email)}`, requestOptions());

    if (res.status === 404) return null;

    if (!res.ok) {
      throw new Error(`Server error while searching (${res.status})`);
    }

    return normaliseCustomer(await res.json());
  } catch (err) {
    console.error('getCustomerByEmail error:', err);
    throw err;
  }
};

// ── Legacy write endpoints (used by admin CRUD pages) ──────────────

export const createCustomer = async (data) => {
  const res = await fetch(BASE_URL, requestOptions({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to create customer (${res.status})`);
  }
  return normaliseCustomer(await res.json());
};

export const updateCustomer = async (id, data) => {
  const res = await fetch(`${BASE_URL}/${id}`, requestOptions({
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to update customer (${res.status})`);
  }
  return normaliseCustomer(await res.json());
};

export const deleteCustomer = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`, requestOptions({ method: 'DELETE' }));
  if (!res.ok) throw new Error(`Failed to delete customer (${res.status})`);
  return res.text();
};
