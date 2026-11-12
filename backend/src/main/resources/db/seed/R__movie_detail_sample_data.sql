-- Dữ liệu mẫu cho GET /api/v1/movies/{movieId}.
-- Chọn database đã chạy V1__khoi_tao_csdl.sql trước khi thực thi file này.
-- Ví dụ trong MySQL Workbench: chọn cinema_db làm Default Schema.
-- Có thể chạy riêng hoặc cùng R__sample_data.sql; ID phim riêng: 1001-1003.
-- ID thể loại giữ tương thích với R__sample_data.sql.
-- Ngày chiếu và trạng thái là dữ liệu giả lập để phát triển, kiểm thử.
-- Poster là ảnh minh họa lấy từ seed chung, không phải poster chính thức.
-- INSERT IGNORE giữ nguyên bản ghi trùng khóa; chạy lại không làm mới ngày chiếu.

START TRANSACTION;

-- 1. Các thể loại cần dùng cho trang chi tiết phim.
INSERT IGNORE INTO the_loai (id, ten) VALUES
    (1, 'Hành động'),
    (2, 'Khoa học viễn tưởng'),
    (4, 'Tâm lý'),
    (5, 'Kinh dị');

-- 2. Thông tin phim: đang chiếu, sắp chiếu và đã xóa mềm.
INSERT IGNORE INTO phim (
    id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc,
    dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung, trang_thai
) VALUES
    (
        1001, 'Dune: Hành Tinh Cát — Phần 2', 166, 'T16',
        DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY),
        DATE_ADD(CURRENT_DATE(), INTERVAL 60 DAY),
        'Denis Villeneuve',
        'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler',
        'Warner Bros. Pictures',
        'https://www.youtube.com/watch?v=Way9Dexny3w',
        'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800',
        'Paul Atreides hợp lực cùng Chani và tộc người Fremen để trả thù những kẻ đã hủy hoại gia đình mình, đồng thời đối mặt với lựa chọn giữa tình yêu và số phận vũ trụ.',
        1
    ),
    (
        1002, 'Oppenheimer: Kẻ Huỷ Diệt', 180, 'T18',
        DATE_ADD(CURRENT_DATE(), INTERVAL 14 DAY),
        DATE_ADD(CURRENT_DATE(), INTERVAL 74 DAY),
        'Christopher Nolan',
        'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh',
        'Universal Pictures',
        'https://www.youtube.com/watch?v=uYPbbksJxIg',
        'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800',
        'Câu chuyện về nhà vật lý lý thuyết J. Robert Oppenheimer, người đứng đầu Dự án Manhattan phát triển bom nguyên tử, cùng những lựa chọn và hệ quả mà ông phải đối mặt.',
        1
    ),
    (
        1003, 'Quật Mộ Trùng Ma', 134, 'T18',
        DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY),
        DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY),
        'Jang Jae-hyun',
        'Choi Min-sik, Kim Go-eun, Yoo Hae-jin, Lee Do-hyun',
        'Showbox',
        'https://www.youtube.com/watch?v=kYJ0i-f5r-Y',
        'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800',
        'Hai pháp sư, một thầy phong thủy và một chuyên gia tang lễ khai quật ngôi mộ cổ tại vùng hẻo lánh, vô tình giải phóng một thế lực tà ác. Bản ghi này dùng để kiểm tra việc loại phim đã xóa mềm.',
        2
    );

-- 3. Mỗi phim có hai thể loại, dùng kiểm tra danh sách genres trong response.
INSERT IGNORE INTO phim_the_loai (phim_id, the_loai_id) VALUES
    (1001, 1), (1001, 2),
    (1002, 4), (1002, 2),
    (1003, 5), (1003, 1);

COMMIT;

-- Kỳ vọng sau khi API chi tiết phim được triển khai:
-- /api/v1/movies/1001: HTTP 200, phim đang chiếu, đầy đủ thông tin và hai thể loại.
-- /api/v1/movies/1002: HTTP 200, phim sắp chiếu vẫn xem được chi tiết.
-- /api/v1/movies/1003: HTTP 404, phim có trang_thai = 2 (đã xóa mềm).
-- ID không tồn tại: chọn một ID chưa có trong database để kiểm tra HTTP 404.
