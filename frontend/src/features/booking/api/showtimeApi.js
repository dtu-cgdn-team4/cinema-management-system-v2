import apiClient from '../../../services/apiClient';

/** Phim đang chiếu: hôm nay nằm trong khoảng khởi chiếu – kết thúc. */
export const getShowingMovies = () => apiClient.get('/movies', { params: { status: 'SHOWING' } });

/** Rạp đang hoạt động. */
export const getCinemas = () => apiClient.get('/cinemas');

/** Suất chiếu chưa bắt đầu của một phim tại một rạp trong một ngày, đã sắp theo giờ. */
export const getShowtimes = (movieId, { cinemaId, date }) =>
  apiClient.get(`/movies/${movieId}/showtimes`, { params: { cinemaId, date } });
