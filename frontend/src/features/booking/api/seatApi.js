import apiClient from '../../../services/apiClient';

/** Sơ đồ ghế của suất chiếu, kèm phim, suất, giá theo loại ghế và số ghế tối đa mỗi lần đặt. */
export const getSeatMap = (showtimeId) => apiClient.get(`/showtimes/${showtimeId}/seats`);

/** Giữ ghế 10 phút (phải đăng nhập); lượt giữ mới thay mọi ghế người này đang giữ. */
export const holdSeats = (showtimeId, { quantity, seatIds }) =>
  apiClient.post(`/showtimes/${showtimeId}/seats/hold`, { quantity, seatIds });
