/**
 * Tên tệp: Hằng số và dữ liệu mẫu quản lý phim (mockMoviesData.js)
 * Chức năng: Định nghĩa trạng thái hiển thị khớp Backend (DANG_CHIEU, SAP_CHIEU, NGUNG_CHIEU),
 * nhãn giới hạn độ tuổi (AgeRating) và bộ dữ liệu mẫu phục vụ kiểm thử đơn vị / chế độ mock.
 */

export const MOVIE_STATUS = {
  DANG_CHIEU: 'DANG_CHIEU',
  SAP_CHIEU: 'SAP_CHIEU',
  NGUNG_CHIEU: 'NGUNG_CHIEU',
};

export const MOVIE_STATUS_META = {
  [MOVIE_STATUS.DANG_CHIEU]: {
    label: 'Đang chiếu',
    code: 1,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  [MOVIE_STATUS.SAP_CHIEU]: {
    label: 'Sắp chiếu',
    code: 1,
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  [MOVIE_STATUS.NGUNG_CHIEU]: {
    label: 'Ngừng chiếu',
    code: 2,
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const AGE_RATING_META = {
  P: { label: 'P', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  K: { label: 'K', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  T13: { label: 'T13', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  T16: { label: 'T16', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  T18: { label: 'T18', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export const MOCK_GENRES = [
  { id: 1, name: 'Hành động' },
  { id: 2, name: 'Hoạt hình' },
  { id: 3, name: 'Hài' },
  { id: 4, name: 'Tâm lý' },
  { id: 5, name: 'Tình cảm' },
  { id: 6, name: 'Kinh dị' },
  { id: 7, name: 'Khoa học viễn tưởng' },
  { id: 8, name: 'Gia đình' },
  { id: 9, name: 'Giật gân' },
];

export const INITIAL_MOCK_MOVIES = [
  {
    id: 1,
    code: 'PH001',
    title: 'Mai',
    genres: ['Tâm lý', 'Tình cảm'],
    duration: 131,
    ageRating: 'T18',
    releaseDate: '2024-02-10',
    endDate: '2024-04-30',
    formats: ['2D'],
    totalShowtimes: 128,
    status: MOVIE_STATUS.DANG_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 2,
    code: 'PH002',
    title: 'Dune: Hành tinh cát – Phần hai',
    genres: ['Khoa học viễn tưởng'],
    duration: 166,
    ageRating: 'T16',
    releaseDate: '2024-03-01',
    endDate: '2024-05-30',
    formats: ['2D'],
    totalShowtimes: 96,
    status: MOVIE_STATUS.DANG_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 3,
    code: 'PH003',
    title: 'Những mảnh ghép cảm xúc 2',
    genres: ['Hoạt hình'],
    duration: 96,
    ageRating: 'P',
    releaseDate: '2024-06-14',
    endDate: '2024-08-30',
    formats: ['2D'],
    totalShowtimes: 84,
    status: MOVIE_STATUS.DANG_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 4,
    code: 'PH004',
    title: 'Kẻ trộm mặt trăng 4',
    genres: ['Hoạt hình', 'Hài', 'Gia đình'],
    duration: 94,
    ageRating: 'P',
    releaseDate: '2024-07-05',
    endDate: '2024-09-30',
    formats: ['2D'],
    totalShowtimes: 32,
    status: MOVIE_STATUS.SAP_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 5,
    code: 'PH005',
    title: 'Vùng đất câm lặng: Ngày một',
    genres: ['Kinh dị', 'Giật gân'],
    duration: 100,
    ageRating: 'T18',
    releaseDate: '2024-06-28',
    endDate: '2024-08-30',
    formats: ['2D'],
    totalShowtimes: 24,
    status: MOVIE_STATUS.SAP_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 6,
    code: 'PH006',
    title: 'Lật mặt 7: Một điều ước',
    genres: ['Tâm lý', 'Gia đình'],
    duration: 138,
    ageRating: 'T13',
    releaseDate: '2024-04-26',
    endDate: '2024-07-15',
    formats: ['2D'],
    totalShowtimes: 156,
    status: MOVIE_STATUS.NGUNG_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 7,
    code: 'PH007',
    title: 'Deadpool & Wolverine',
    genres: ['Hành động', 'Hài'],
    duration: 127,
    ageRating: 'T18',
    releaseDate: '2024-07-26',
    endDate: '2024-10-15',
    formats: ['2D'],
    totalShowtimes: 112,
    status: MOVIE_STATUS.DANG_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=360&q=80',
  },
  {
    id: 8,
    code: 'PH008',
    title: 'Quật mộ trùng ma',
    genres: ['Kinh dị', 'Tâm lý'],
    duration: 134,
    ageRating: 'T16',
    releaseDate: '2024-03-15',
    endDate: '2024-06-15',
    formats: ['2D'],
    totalShowtimes: 140,
    status: MOVIE_STATUS.NGUNG_CHIEU,
    posterUrl:
      'https://images.unsplash.com/photo-1514539079130-25950c84af65?auto=format&fit=crop&w=360&q=80',
  },
];
