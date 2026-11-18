/**
 * Tên tệp: API quản lý phim dành cho quản trị viên (adminMovieApi.js)
 * Chức năng: Kết nối trực tiếp REST API Spring Boot (GET /api/admin/movies,
 * DELETE /api/admin/movies/{id}, GET /api/v1/movies/genres), đồng thời giữ nhánh mock
 * khi bật VITE_USE_MOCK_API=true phục vụ kiểm thử đơn vị.
 */
import { INITIAL_MOCK_MOVIES, MOCK_GENRES, MOVIE_STATUS } from './mockMoviesData.js';

const STORAGE_KEY = 'galaxy_admin_movies_mock_v3';

// Mặc định gọi Backend thật; chỉ dùng Mock khi bật tường minh VITE_USE_MOCK_API=true
const isMockEnabled = () =>
  import.meta.env?.VITE_USE_MOCK_API === 'true' ||
  globalThis.process?.env?.VITE_USE_MOCK_API === 'true';

let cachedAdminClient = null;
let cachedApiModule = null;

async function getApiModule() {
  if (!cachedApiModule) {
    cachedApiModule = await import('../../../services/apiClient.js');
  }
  return cachedApiModule;
}

/**
 * Khởi tạo axios client riêng cho phân hệ Admin (trỏ về root origin, ví dụ: http://localhost:8080).
 * Lý do: MovieAdminController trên backend khai báo @RequestMapping("/api/admin/movies") thay vì tiền tố "/api/v1".
 * Tự động gắn JWT Bearer Token từ Storage vào Header của mọi request.
 */
async function getAdminHttpClient() {
  if (cachedAdminClient) return cachedAdminClient;
  const [{ default: axios }, { API_BASE_URL, applyRefreshInterceptor }] = await Promise.all([
    import('axios'),
    getApiModule(),
  ]);
  const rootBaseUrl = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const client = axios.create({
    baseURL: rootBaseUrl,
    withCredentials: true,
  });
  client.interceptors.request.use((config) => {
    const token =
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  applyRefreshInterceptor(client);
  cachedAdminClient = client;
  return cachedAdminClient;
}

/**
 * Trích xuất câu thông báo lỗi thân thiện bằng tiếng Việt từ phản hồi của server hoặc Exception.
 */
export async function extractErrorMessage(err) {
  try {
    const { errorMessage } = await getApiModule();
    return errorMessage(err);
  } catch {
    return err?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.';
  }
}

/**
 * Hàm chuyển đổi (adapter): Chuẩn hóa dữ liệu MovieAdminResponse từ Backend sang UI model
 * - Tạo mã hiển thị định dạng PHxxx (ví dụ: ID 1 -> PH001).
 * - Đảm bảo dữ liệu mảng thể loại, nhãn tuổi, thời lượng luôn hợp lệ cho bảng hiển thị.
 */
export function mapBackendMovieToUi(item) {
  return {
    id: item.id,
    code: `PH${String(item.id).padStart(3, '0')}`,
    title: item.tenPhim ?? '',
    posterUrl: item.posterUrl ?? '',
    genres: Array.isArray(item.theLoai) ? item.theLoai : [],
    duration: item.thoiLuong ?? 0,
    ageRating: item.nhanTuoi ?? '',
    releaseDate: item.ngayKhoiChieu ?? '',
    endDate: item.ngayKetThuc ?? '',
    formats: item.dinhDang ? [item.dinhDang] : ['2D'],
    totalShowtimes: item.tongSuatChieu ?? 0,
    status: item.trangThaiHienThi ?? MOVIE_STATUS.DANG_CHIEU,
    rawStatus: item.trangThai,
  };
}

function loadMoviesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_MOVIES));
      return [...INITIAL_MOCK_MOVIES];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_MOCK_MOVIES];
  }
}

function saveMoviesToStorage(movies) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
  } catch {
    // Bỏ qua nếu môi trường chạy không hỗ trợ lưu localStorage
  }
}

/**
 * Hàm chuẩn hóa chuỗi tiếng Việt: Bỏ dấu, chuyển chữ thường để tìm kiếm gần đúng chính xác.
 */
function normalizeText(value = '') {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();
}

/**
 * Lấy danh sách thể loại phim từ API: GET /api/v1/movies/genres để nạp vào dropdown lọc.
 */
export async function fetchAdminGenres() {
  if (isMockEnabled()) {
    return MOCK_GENRES;
  }
  const { default: apiClient } = await getApiModule();
  const list = await apiClient.get('/movies/genres');
  return Array.isArray(list) ? list : [];
}

/**
 * Lấy danh sách phim cho Quản trị viên kèm phân trang, tìm kiếm và bộ lọc:
 * - Gọi API: GET /api/admin/movies với các tham số keyword, theLoaiId, status, page, size.
 * - Kỹ thuật tối ưu: Gửi song song các request phụ nhẹ (size=1) theo từng trạng thái để tính
 *   số lượng động cho cả 4 tab (Tất cả, Đang chiếu, Sắp chiếu, Ngừng chiếu) trong một chu kỳ tải.
 */
export async function fetchAdminMovies({
  keyword = '',
  genreId = 'ALL',
  status = 'ALL',
  page = 1,
  size = 6,
} = {}) {
  if (!isMockEnabled()) {
    const adminClient = await getAdminHttpClient();
    const baseFilterParams = {};
    if (keyword && keyword.trim()) {
      baseFilterParams.keyword = keyword.trim();
    }
    if (genreId && genreId !== 'ALL') {
      baseFilterParams.theLoaiId = Number(genreId);
    }

    const mainParams = {
      ...baseFilterParams,
      page: Math.max(0, page - 1),
      size,
    };
    if (status && status !== 'ALL') {
      mainParams.status = status;
    }

    const allStatusKeys = [
      'ALL',
      MOVIE_STATUS.DANG_CHIEU,
      MOVIE_STATUS.SAP_CHIEU,
      MOVIE_STATUS.NGUNG_CHIEU,
    ];
    const activeTabKey = status && status !== 'ALL' ? status : 'ALL';
    const otherTabKeys = allStatusKeys.filter((k) => k !== activeTabKey);

    const [mainPage, ...countPages] = await Promise.all([
      adminClient.get('/api/admin/movies', { params: mainParams }),
      ...otherTabKeys.map((tabKey) => {
        const countParams = { ...baseFilterParams, page: 0, size: 1 };
        if (tabKey !== 'ALL') {
          countParams.status = tabKey;
        }
        return adminClient.get('/api/admin/movies', { params: countParams });
      }),
    ]);

    const summaryCounts = {
      [activeTabKey]: mainPage?.totalElements ?? 0,
    };
    otherTabKeys.forEach((tabKey, idx) => {
      summaryCounts[tabKey] = countPages[idx]?.totalElements ?? 0;
    });

    const content = Array.isArray(mainPage?.content) ? mainPage.content : [];
    return {
      items: content.map(mapBackendMovieToUi),
      page: (mainPage?.pageNo ?? 0) + 1,
      size: mainPage?.pageSize ?? size,
      totalElements: mainPage?.totalElements ?? 0,
      totalPages: Math.max(1, mainPage?.totalPages ?? 1),
      summaryCounts,
    };
  }

  // Nhánh Mock phục vụ kiểm thử đơn vị khi chạy npm test
  const allMovies = loadMoviesFromStorage();
  const normalizedQuery = normalizeText(keyword);
  const selectedGenreObj =
    genreId && genreId !== 'ALL'
      ? MOCK_GENRES.find((g) => String(g.id) === String(genreId) || g.name === genreId)
      : null;

  const baseFiltered = allMovies.filter((movie) => {
    const matchesKeyword =
      !normalizedQuery ||
      normalizeText(movie.title).includes(normalizedQuery) ||
      normalizeText(movie.code).includes(normalizedQuery);
    const matchesGenre =
      !selectedGenreObj || movie.genres.includes(selectedGenreObj.name);
    return matchesKeyword && matchesGenre;
  });

  const summaryCounts = {
    ALL: baseFiltered.length,
    [MOVIE_STATUS.DANG_CHIEU]: baseFiltered.filter((m) => m.status === MOVIE_STATUS.DANG_CHIEU).length,
    [MOVIE_STATUS.SAP_CHIEU]: baseFiltered.filter((m) => m.status === MOVIE_STATUS.SAP_CHIEU).length,
    [MOVIE_STATUS.NGUNG_CHIEU]: baseFiltered.filter((m) => m.status === MOVIE_STATUS.NGUNG_CHIEU).length,
  };

  const filtered =
    status && status !== 'ALL'
      ? baseFiltered.filter((m) => m.status === status)
      : baseFiltered;

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * size;

  return {
    items: filtered.slice(startIndex, startIndex + size),
    page: safePage,
    size,
    totalElements,
    totalPages,
    summaryCounts,
  };
}

/**
 * Xóa mềm phim (Ngừng phát hành) qua API: DELETE /api/admin/movies/{id}.
 * Backend chỉ cập nhật trạng thái trong cơ sở dữ liệu thành trang_thai = 2 (NGUNG_CHIEU),
 * tuyệt đối không dùng lệnh DELETE vật lý để bảo toàn lịch sử đặt vé và dữ liệu tài chính.
 */
export async function softDeleteAdminMovie(movieId) {
  if (!isMockEnabled()) {
    const adminClient = await getAdminHttpClient();
    return adminClient.delete(`/api/admin/movies/${movieId}`);
  }

  const allMovies = loadMoviesFromStorage();
  const targetIndex = allMovies.findIndex((m) => m.id === Number(movieId));
  if (targetIndex === -1) {
    throw new Error('Không tìm thấy bộ phim cần ngừng phát hành.');
  }

  const updatedMovie = {
    ...allMovies[targetIndex],
    status: MOVIE_STATUS.NGUNG_CHIEU,
  };
  allMovies[targetIndex] = updatedMovie;
  saveMoviesToStorage(allMovies);
  return updatedMovie;
}

/**
 * Đặt lại dữ liệu giả lập về trạng thái ban đầu (dùng trong teardown của test unit).
 */
export async function resetAdminMoviesMock() {
  saveMoviesToStorage(INITIAL_MOCK_MOVIES);
  return [...INITIAL_MOCK_MOVIES];
}
