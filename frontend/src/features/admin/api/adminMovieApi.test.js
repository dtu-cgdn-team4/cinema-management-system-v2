/**
 * Tên tệp: Kiểm thử đơn vị API quản lý phim (adminMovieApi.test.js)
 * Chức năng: Kiểm thử chuẩn hóa dữ liệu Backend MovieAdminResponse -> UI model
 * và các kịch bản phân trang, tìm kiếm, lọc, xóa mềm ở chế độ mock.
 */
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

process.env.VITE_USE_MOCK_API = 'true';

const memoryStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => (memoryStorage.has(key) ? memoryStorage.get(key) : null),
  setItem: (key, value) => memoryStorage.set(key, String(value)),
  removeItem: (key) => memoryStorage.delete(key),
  clear: () => memoryStorage.clear(),
};

const {
  fetchAdminGenres,
  fetchAdminMovies,
  mapBackendMovieToUi,
  resetAdminMoviesMock,
  softDeleteAdminMovie,
} = await import('./adminMovieApi.js');
const { MOVIE_STATUS } = await import('./mockMoviesData.js');

describe('adminMovieApi - Task 3 Quản lý danh sách phim & Xóa mềm', () => {
  beforeEach(async () => {
    memoryStorage.clear();
    await resetAdminMoviesMock();
  });

  it('chuẩn hóa chính xác MovieAdminResponse từ Backend sang dữ liệu hiển thị UI', () => {
    const mapped = mapBackendMovieToUi({
      id: 7,
      tenPhim: 'Mai',
      posterUrl: 'https://example.com/mai.jpg',
      theLoai: ['Tâm lý', 'Tình cảm'],
      thoiLuong: 131,
      nhanTuoi: 'T18',
      ngayKhoiChieu: '2026-11-01',
      ngayKetThuc: '2026-11-30',
      dinhDang: '2D',
      tongSuatChieu: 12,
      trangThaiHienThi: 'DANG_CHIEU',
      trangThai: 1,
    });

    assert.equal(mapped.id, 7);
    assert.equal(mapped.code, 'PH007');
    assert.equal(mapped.title, 'Mai');
    assert.deepEqual(mapped.genres, ['Tâm lý', 'Tình cảm']);
    assert.equal(mapped.duration, 131);
    assert.equal(mapped.ageRating, 'T18');
    assert.deepEqual(mapped.formats, ['2D']);
    assert.equal(mapped.totalShowtimes, 12);
    assert.equal(mapped.status, MOVIE_STATUS.DANG_CHIEU);
    assert.equal(mapped.rawStatus, 1);
  });

  it('trả về danh sách phim phân trang 6 phim/trang và thống kê đúng 4 tab trạng thái', async () => {
    const res = await fetchAdminMovies({ page: 1, size: 6 });
    assert.equal(res.items.length, 6);
    assert.equal(res.totalElements, 8);
    assert.equal(res.totalPages, 2);
    assert.equal(res.summaryCounts.ALL, 8);
    assert.equal(res.summaryCounts[MOVIE_STATUS.DANG_CHIEU], 4);
    assert.equal(res.summaryCounts[MOVIE_STATUS.SAP_CHIEU], 2);
    assert.equal(res.summaryCounts[MOVIE_STATUS.NGUNG_CHIEU], 2);
  });

  it('tìm kiếm chính xác theo tên phim tiếng Việt không dấu hoặc mã phim', async () => {
    const byName = await fetchAdminMovies({ keyword: 'hanh tinh cat', page: 1, size: 6 });
    assert.equal(byName.totalElements, 1);
    assert.equal(byName.items[0].code, 'PH002');

    const byCode = await fetchAdminMovies({ keyword: 'PH004', page: 1, size: 6 });
    assert.equal(byCode.totalElements, 1);
    assert.equal(byCode.items[0].title, 'Kẻ trộm mặt trăng 4');
  });

  it('lọc chính xác theo thể loại (genreId) và trạng thái (DANG_CHIEU)', async () => {
    const genres = await fetchAdminGenres();
    const hoatHinh = genres.find((g) => g.name === 'Hoạt hình');
    assert.ok(hoatHinh);

    const res = await fetchAdminMovies({
      genreId: String(hoatHinh.id),
      status: MOVIE_STATUS.DANG_CHIEU,
      page: 1,
      size: 10,
    });
    assert.equal(res.totalElements, 1);
    assert.equal(res.items[0].code, 'PH003');
    assert.equal(res.summaryCounts.ALL, 2);
    assert.equal(res.summaryCounts[MOVIE_STATUS.DANG_CHIEU], 1);
    assert.equal(res.summaryCounts[MOVIE_STATUS.SAP_CHIEU], 1);
  });

  it('xóa mềm chuyển trạng thái sang NGUNG_CHIEU và bảo toàn tổng số bản ghi', async () => {
    const updated = await softDeleteAdminMovie(1);
    assert.equal(updated.id, 1);
    assert.equal(updated.status, MOVIE_STATUS.NGUNG_CHIEU);

    const afterDelete = await fetchAdminMovies({ page: 1, size: 6 });
    assert.equal(afterDelete.totalElements, 8);
    assert.equal(afterDelete.summaryCounts[MOVIE_STATUS.NGUNG_CHIEU], 3);
    assert.equal(afterDelete.summaryCounts[MOVIE_STATUS.DANG_CHIEU], 3);
  });
});
