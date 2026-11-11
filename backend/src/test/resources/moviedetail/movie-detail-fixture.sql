-- Isolated test data, loaded against the unchanged V1 schema and rolled back after each test.
INSERT INTO the_loai (id, ten) VALUES (9401, 'Hành động'), (9402, 'Tâm lý');

INSERT INTO phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc,
                  dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung, trang_thai)
VALUES
    (9001, 'Phim kiểm thử', 120, 'T16', '2000-01-01', '2100-01-01', 'Đạo diễn',
     ' Diễn viên A, Diễn viên B ', 'Hãng kiểm thử', 'https://www.youtube.com/watch?v=test',
     'https://cinema.example/poster.jpg', 'Nội dung phim', 1),
    (9002, 'Phim đã xóa', 90, 'P', '2000-01-01', '2100-01-01', 'Đạo diễn',
     'Diễn viên', 'Hãng kiểm thử', '', '', 'Phim đã xóa mềm', 2),
    (9003, 'Phim sắp chiếu', 100, 'K', '2099-01-01', '2100-01-01', 'Đạo diễn',
     'Diễn viên', 'Hãng kiểm thử', '', '', 'Phim sắp chiếu', 1),
    (9004, 'Phim chưa có lịch chiếu', 90, 'P', '2000-01-01', '2100-01-01', 'Đạo diễn',
     '', 'Hãng kiểm thử', '', '', 'Chưa có thông tin bổ sung', 1);

INSERT INTO phim_the_loai (phim_id, the_loai_id) VALUES (9001, 9402), (9001, 9401);

INSERT INTO rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai, gio_mo_cua, gio_dong_cua,
                 hinh_anh_url, trang_thai)
VALUES
    (9201, 'Rạp kiểm thử', 'Đà Nẵng', 'Địa chỉ kiểm thử', '0900000001', '08:00:00', '23:00:00', '', 1),
    (9202, 'Rạp đã xóa', 'Đà Nẵng', 'Địa chỉ kiểm thử', '0900000002', '08:00:00', '23:00:00', '', 2);

INSERT INTO phong_chieu (id, rap_id, ten_phong, so_hang, so_cot, trang_thai)
VALUES
    (9101, 9201, 'Phòng kiểm thử', 5, 8, 1),
    (9102, 9201, 'Phòng đã xóa', 5, 8, 2),
    (9103, 9202, 'Phòng thuộc rạp đã xóa', 5, 8, 1);

INSERT INTO suat_chieu (id, phim_id, phong_chieu_id, bat_dau, ket_thuc, trang_thai)
VALUES
    (9301, 9001, 9101, '2099-01-01 14:30:00', '2099-01-01 16:45:00', 1),
    (9302, 9001, 9101, '2099-01-01 12:00:00', '2099-01-01 14:15:00', 1),
    (9303, 9001, 9101, '2000-01-01 12:00:00', '2000-01-01 14:15:00', 1),
    (9304, 9001, 9101, '2099-01-01 17:00:00', '2099-01-01 19:15:00', 2),
    (9305, 9001, 9102, '2099-01-01 12:00:00', '2099-01-01 14:15:00', 1),
    (9306, 9001, 9103, '2099-01-01 12:00:00', '2099-01-01 14:15:00', 1),
    (9307, 9003, 9101, '2099-01-02 12:00:00', '2099-01-02 14:15:00', 1);
