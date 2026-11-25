import apiClient, { API_BASE_URL } from '@/services/apiClient';

// Lấy origin (http://localhost:8080) — bỏ hoàn toàn path /api/v1
// để tránh double /api/api/ khi ghép với path /api/me/bookings
const BACKEND_ORIGIN = new URL(API_BASE_URL).origin;

/**
 * Lấy danh sách vé đã đặt của thành viên đang đăng nhập.
 * Endpoint: GET /api/me/bookings (không có /v1)
 */
export const fetchMemberTickets = ({ page = 0, size = 10, view = 'ALL' } = {}) =>
  apiClient.get('/api/me/bookings', {
    baseURL: BACKEND_ORIGIN,
    params: { page, size, view },
  });

