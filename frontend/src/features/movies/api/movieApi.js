import apiClient from '@/services/apiClient';

async function loadMovies(path, keyword, signal) {
  const params = { page: 0, size: 100, keyword: keyword.trim() || undefined };
  const first = await apiClient.get(path, { params, signal });
  const movies = [...first.content];
  for (let page = 1; page < first.totalPages; page++) {
    const next = await apiClient.get(path, { params: { ...params, page }, signal });
    movies.push(...next.content);
  }
  return movies;
}

// apiClient đã lấy trường data từ ApiResponse của backend.
export const movieApi = {
  getGenres: (signal) => apiClient.get('/movies/genres', { signal }),
  getNowShowingMovies: (keyword = '', signal) => loadMovies('/movies/now-showing', keyword, signal),
  getComingSoonMovies: (keyword = '', signal) => loadMovies('/movies/coming-soon', keyword, signal),
};
