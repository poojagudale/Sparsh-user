import { createAuthenticatedAxios } from './authApi';

/**
 * BookingApi.js
 *
 * All booking-related API calls against the Spring Boot backend.
 * Uses the authenticated axios instance from authApi.js so the JWT
 * is automatically attached to every request.
 *
 * Customer endpoints : /api/bookings/**
 * Admin endpoints    : /api/admin/bookings/**
 */

// ── Helpers ────────────────────────────────────────────────────────

function parseError(error) {
  if (error.response) {
    const data = error.response.data;
    if (data?.errors) {
      const msgs = Object.entries(data.errors)
        .map(([field, msg]) => `${field}: ${msg}`)
        .join(', ');
      return new Error(msgs);
    }
    return new Error(
      data?.message || `Request failed with status ${error.response.status}`
    );
  }
  if (error.request) {
    return new Error('No response received from the server. Please try again.');
  }
  return new Error(error.message || 'Unknown error');
}

// ── Customer Booking APIs ──────────────────────────────────────────

/**
 * POST /api/bookings — create a new appointment request
 */
export async function createBooking(bookingData) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * GET /api/bookings/my — get current user's bookings
 */
export async function getMyBookings() {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.get('/bookings/my');
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * GET /api/bookings/{id} — get a single booking
 */
export async function getBookingById(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * PUT /api/bookings/{id}/cancel — cancel a booking
 */
export async function cancelBooking(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.put(`/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

// ── Admin Booking APIs ─────────────────────────────────────────────

/**
 * GET /api/admin/bookings — get all bookings (admin)
 */
export async function adminGetAllBookings() {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.get('/admin/bookings');
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * GET /api/admin/bookings/{id} — get booking details (admin)
 */
export async function adminGetBookingById(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.get(`/admin/bookings/${bookingId}`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * PUT /api/admin/bookings/{id}/confirm
 */
export async function adminConfirmBooking(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.put(`/admin/bookings/${bookingId}/confirm`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * PUT /api/admin/bookings/{id}/reject
 */
export async function adminRejectBooking(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.put(`/admin/bookings/${bookingId}/reject`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * PUT /api/admin/bookings/{id}/complete
 */
export async function adminCompleteBooking(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.put(`/admin/bookings/${bookingId}/complete`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}

/**
 * PUT /api/admin/bookings/{id}/cancel
 */
export async function adminCancelBooking(bookingId) {
  try {
    const api = createAuthenticatedAxios();
    const response = await api.put(`/admin/bookings/${bookingId}/cancel`);
    return response.data;
  } catch (error) {
    throw parseError(error);
  }
}
