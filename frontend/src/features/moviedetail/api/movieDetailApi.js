import apiClient from '@/services/apiClient';

// apiClient đã có baseURL = /api/v1, đã tự lấy .data.data từ ApiResponse.
// Các path ở đây sẽ gọi đến: /api/v1/movies/{movieId}/...

export const movieDetailApi = {
  /** GET /api/v1/movies/{movieId} */
  getMovieDetail: (movieId, signal) =>
    apiClient.get(`/movies/${movieId}`, { signal, timeout: 8000 }),

  /** GET /api/v1/movies/{movieId}/schedule?date=&city=&cinemaId= */
  getShowtimes: (movieId, { date, city, cinemaId } = {}, signal) => {
    const params = {};
    if (date) params.date = date;
    if (city) params.city = city;
    if (cinemaId) params.cinemaId = cinemaId;
    return apiClient.get(`/movies/${movieId}/schedule`, { params, signal, timeout: 8000 });
  },

  /** GET /api/v1/movies/{movieId}/related?limit= */
  getRelatedMovies: (movieId, limit = 4, signal) =>
    apiClient.get(`/movies/${movieId}/related`, { params: { limit }, signal, timeout: 8000 }),
};
