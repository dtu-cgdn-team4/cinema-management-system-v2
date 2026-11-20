import apiClient from '@/services/apiClient';

async function loadMovies(path, keyword, signal) {
  const params = { page: 0, size: 100, keyword: keyword.trim() || undefined };
  const first = await apiClient.get(path, { params, signal, timeout: 8000 });
  const movies = [...first.content];
  for (let page = 1; page < first.totalPages; page++) {
    const next = await apiClient.get(path, { params: { ...params, page }, signal, timeout: 8000 });
    movies.push(...next.content);
  }
  return movies;
}

// apiClient đã lấy trường data từ ApiResponse của backend.
export const movieApi = {
  getFeaturedMovies: (signal) => apiClient.get('/movies/featured', { signal, timeout: 8000 }),
  getGenres: (signal) => apiClient.get('/movies/genres', { signal, timeout: 8000 }),
  getNowShowingMovies: (keyword = '', signal) => loadMovies('/movies/now-showing', keyword, signal),
  getComingSoonMovies: (keyword = '', signal) => loadMovies('/movies/coming-soon', keyword, signal),
};
