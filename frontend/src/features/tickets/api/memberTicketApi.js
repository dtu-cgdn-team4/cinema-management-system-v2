import apiClient, { API_BASE_URL } from '@/services/apiClient';

// These member booking endpoints live outside the configured /api/v1 base path.
const BACKEND_ORIGIN = new URL(API_BASE_URL, window.location.origin).origin;

export const fetchMemberTicketDetail = (bookingCode) =>
  apiClient.get(`/api/me/bookings/${encodeURIComponent(bookingCode)}`, {
    baseURL: BACKEND_ORIGIN,
  });
