// Chỉ dùng để xem thử giao diện khi API không khả dụng. Lịch chiếu là giả lập.
const today = new Date();
function demoDate(offset) {
  const date = new Date(today);
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export const mockMovies = [
  { id: 'demo-1', title: 'Interstellar (Demo)', duration: 169, ageRating: 'T13', genres: ['Khoa học viễn tưởng', 'Phiêu lưu'], director: 'Christopher Nolan', actors: ['Matthew McConaughey', 'Anne Hathaway'], status: 'NOW_SHOWING', releaseDate: demoDate(-7), posterUrl: '/images/movies/7.jpg' },
  { id: 'demo-2', title: 'Mai (Demo)', duration: 131, ageRating: 'T18', genres: ['Tâm lý', 'Tình cảm'], director: 'Trấn Thành', actors: ['Phương Anh Đào', 'Tuấn Trần'], status: 'NOW_SHOWING', releaseDate: demoDate(-14), posterUrl: '/images/movies/3.jpg' },
  { id: 'demo-3', title: 'Inception (Demo)', duration: 148, ageRating: 'T13', genres: ['Hành động', 'Khoa học viễn tưởng'], director: 'Christopher Nolan', actors: ['Leonardo DiCaprio', 'Cillian Murphy'], status: 'COMING_SOON', releaseDate: demoDate(7), posterUrl: '/images/movies/8.jpg' },
  { id: 'demo-4', title: 'Arrival (Demo)', duration: 116, ageRating: 'T13', genres: ['Khoa học viễn tưởng', 'Tâm lý'], director: 'Denis Villeneuve', actors: ['Amy Adams', 'Jeremy Renner'], status: 'COMING_SOON', releaseDate: demoDate(14), posterUrl: '/images/movies/9.jpg' },
].map((movie) => ({
  ...movie,
  genre: movie.genres.join(', '),
  trailerUrl: {
    'demo-1': 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    'demo-2': 'https://www.youtube.com/watch?v=HXWRTGbhb4U',
    'demo-3': 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    'demo-4': 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
  }[movie.id],
}));

export const mockGenres = [...new Set(mockMovies.flatMap((movie) => movie.genres))];

export function searchMockMovies(keyword = '') {
  const query = keyword.trim().toLocaleLowerCase('vi');
  return mockMovies.filter((movie) => [movie.title, movie.director, ...movie.actors]
    .some((value) => value.toLocaleLowerCase('vi').includes(query)));
}

export function shouldUseMockMovies(error) {
  return error?.code !== 'ERR_CANCELED' &&
    (!error?.response || error.response.status >= 500);
}
