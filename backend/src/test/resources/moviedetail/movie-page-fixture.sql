-- Additional transactional fixtures for the detail-page schedule and recommendations.
INSERT INTO phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc,
                  dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung, trang_thai)
VALUES
    (9005, 'Phim đã kết thúc', 90, 'P', '1999-01-01', '2000-01-01', 'Đạo diễn',
     '', 'Hãng phim', '', '', 'Không đưa vào phim liên quan', 1),
    (9006, 'Phim chung hai thể loại', 110, 'T13', '2001-01-01', '2100-01-01', 'Đạo diễn',
     '', 'Hãng phim', '', 'https://cinema.example/related.jpg', 'Phim liên quan', 1),
    (9007, 'Phim chung một thể loại', 100, 'T16', '2099-01-01', '2100-01-01', 'Đạo diễn',
     '', 'Hãng phim', '', '', 'Phim liên quan sắp chiếu', 1);

INSERT INTO phim_the_loai (phim_id, the_loai_id)
VALUES (9002, 9401), (9002, 9402), (9003, 9401), (9005, 9401), (9005, 9402),
       (9006, 9401), (9006, 9402), (9007, 9402);

INSERT INTO rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai, gio_mo_cua, gio_dong_cua,
                 hinh_anh_url, trang_thai)
VALUES
    (9203, 'Rạp HCM', 'TP. Hồ Chí Minh', 'Địa chỉ HCM', '0900000003', '00:00:00', '23:59:59', '', 1),
    (9204, 'Rạp phụ', 'Đà Nẵng', 'Địa chỉ rạp phụ', '0900000004', '00:00:00', '23:59:59', '', 1);

INSERT INTO phong_chieu (id, rap_id, ten_phong, so_hang, so_cot, trang_thai)
VALUES (9104, 9201, 'Phòng 2', 5, 8, 1), (9105, 9203, 'Phòng HCM', 5, 8, 1),
       (9106, 9204, 'Phòng rạp phụ', 5, 8, 1);

INSERT INTO suat_chieu (id, phim_id, phong_chieu_id, bat_dau, ket_thuc, trang_thai)
VALUES
    (9310, 9001, 9104, '2099-01-01 18:00:00', '2099-01-01 20:15:00', 1),
    (9311, 9001, 9105, '2099-01-01 12:00:00', '2099-01-01 14:15:00', 1),
    (9312, 9001, 9106, '2099-01-01 12:00:00', '2099-01-01 14:15:00', 1),
    (9313, 9001, 9101, '2099-01-02 12:00:00', '2099-01-02 14:15:00', 1),
    (9314, 9001, 9101, '2099-01-02 00:00:00', '2099-01-02 02:15:00', 1),
    (9315, 9001, 9101, '2099-01-01 23:30:00', '2099-01-02 01:45:00', 1),
    (9316, 9001, 9101, '2099-01-01 00:00:00', '2099-01-01 02:15:00', 1);

INSERT INTO ghe (id, phong_chieu_id, ten_hang, so_ghe, vi_tri_cot, loai_ghe, trang_thai)
VALUES
    (9501, 9101, 'A', 1, 1, 'THUONG', 1), (9502, 9101, 'A', 2, 2, 'THUONG', 1),
    (9503, 9101, 'A', 3, 3, 'THUONG', 1), (9504, 9101, 'A', 4, 4, 'THUONG', 1),
    (9505, 9101, 'B', 1, 1, 'VIP', 1), (9506, 9101, 'B', 2, 2, 'VIP', 1),
    (9507, 9101, 'B', 3, 3, 'VIP', 1), (9508, 9101, 'B', 4, 4, 'VIP', 1),
    (9509, 9101, 'B', 5, 5, 'VIP', 2), (9510, 9104, 'A', 1, 1, 'LOAI_MOI', 1);

INSERT INTO ghe_suat_chieu (id, suat_chieu_id, ghe_id, trang_thai_ghe, het_han_luc)
VALUES
    (9601, 9302, 9501, 'DA_THANH_TOAN', NULL),
    (9602, 9302, 9502, 'DANG_GIU', '2100-01-01 00:00:00'),
    (9603, 9302, 9503, 'DANG_GIU', '2000-01-01 00:00:00'),
    (9604, 9302, 9504, 'CHO_THANH_TOAN', NULL),
    (9605, 9302, 9505, 'DANG_GIU', NULL),
    (9606, 9302, 9509, 'DA_THANH_TOAN', NULL),
    (9607, 9302, 9510, 'DA_THANH_TOAN', NULL),
    (9608, 9310, 9510, 'DA_THANH_TOAN', NULL);

INSERT INTO bang_gia (thu_trong_tuan, loai_ghe, gia)
VALUES (1, 'VIP', 70001), (2, 'VIP', 70002), (3, 'VIP', 70003), (4, 'VIP', 70004),
       (5, 'VIP', 70005), (6, 'VIP', 70006), (7, 'VIP', 70007);
