-- Dữ liệu mẫu để phát triển, ngày tính theo ngày chạy migration.
-- Repeatable migration chạy lại khi file đổi và sẽ chèn trùng: đổi file này thì tạo lại database.

-- Rạp
INSERT INTO rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai, gio_mo_cua, gio_dong_cua, hinh_anh_url) VALUES
    (1, 'Galaxy Nguyễn Du', 'Đà Nẵng', '116 Nguyễn Du, quận Hải Châu', '02363001001', '09:00:00', '23:59:00', ''),
    (2, 'Galaxy Đà Nẵng Center', 'Đà Nẵng', '255 Hùng Vương, quận Thanh Khê', '02363001002', '09:00:00', '23:59:00', ''),
    (3, 'Galaxy Sông Hàn', 'Đà Nẵng', '12 Bạch Đằng, quận Hải Châu', '02363001003', '09:00:00', '23:59:00', ''),
    (4, 'Lumière Landmark 81', 'TP. Hồ Chí Minh', 'Tầng B1, Vincom Center Landmark 81, quận Bình Thạnh', '02873001004', '09:00:00', '23:59:00', ''),
    (5, 'Lumière Tân Bình', 'TP. Hồ Chí Minh', '246 Nguyễn Hồng Đào, quận Tân Bình', '02873001005', '09:00:00', '23:59:00', '');

INSERT INTO phong_chieu (rap_id, ten_phong, so_hang, so_cot) VALUES
    (1, 'Phòng 01', 8, 14), (1, 'Phòng 02', 8, 14), (1, 'Phòng 03', 8, 14),
    (2, 'Phòng 01', 8, 14), (2, 'Phòng 02', 8, 14),
    (3, 'Phòng 01', 8, 14),
    (4, 'Phòng 01', 8, 14), (4, 'Phòng 02', 8, 14),
    (5, 'Phòng 01', 8, 14);

-- Tài khoản mẫu, mật khẩu đều là 123456
INSERT INTO nguoi_dung (id, tai_khoan, mat_khau, ho_ten, email, so_dien_thoai, ngay_sinh, gioi_tinh, vai_tro, rap_id) VALUES
    (1, 'khach1', '$2a$10$0YUmnRzrCtjGnIOaPcEEEu3C/Ztpwa.gsUZtR9.ZLK.PrgrkwNvAy', 'Nguyễn Văn An', 'khach1@example.com', '0900000001', '2000-01-15', 'NAM', 'KHACH_HANG', NULL),
    (2, 'khach2', '$2a$10$0YUmnRzrCtjGnIOaPcEEEu3C/Ztpwa.gsUZtR9.ZLK.PrgrkwNvAy', 'Trần Thị Bình', 'khach2@example.com', '0900000002', '2001-05-20', 'NU', 'KHACH_HANG', NULL),
    (3, 'nhanvien1', '$2a$10$0YUmnRzrCtjGnIOaPcEEEu3C/Ztpwa.gsUZtR9.ZLK.PrgrkwNvAy', 'Lê Văn Cường', 'nhanvien1@example.com', '0900000003', '1998-03-10', 'NAM', 'NHAN_VIEN', 1),
    (4, 'admin', '$2a$10$0YUmnRzrCtjGnIOaPcEEEu3C/Ztpwa.gsUZtR9.ZLK.PrgrkwNvAy', 'Quản Trị Viên', 'admin@example.com', '0900000004', '1995-07-25', 'NAM', 'ADMIN', NULL);

INSERT INTO the_loai (id, ten) VALUES
    (1, 'Khoa học viễn tưởng'),
    (2, 'Hành động'),
    (3, 'Tâm lý'),
    (4, 'Kinh dị'),
    (5, 'Hoạt hình');

-- poster_url, trailer_url để trống: giao diện hiện ô thay thế
INSERT INTO phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc, dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung) VALUES
    (1, 'Dune: Hành Tinh Cát – Phần 2', 166, 'T16', TIMESTAMPADD(DAY, -10, CURRENT_DATE), TIMESTAMPADD(DAY, 30, CURRENT_DATE), 'Denis Villeneuve', 'Timothée Chalamet, Zendaya', 'Legendary Pictures', '', '', 'Paul Atreides liên minh cùng Chani và tộc Fremen để báo thù những kẻ đã hủy diệt gia tộc anh, đối mặt với sự lựa chọn giữa tình yêu định mệnh và vận mệnh của cả vũ trụ.'),
    (2, 'Mai', 131, 'T18', TIMESTAMPADD(DAY, -5, CURRENT_DATE), TIMESTAMPADD(DAY, 25, CURRENT_DATE), 'Trấn Thành', 'Phương Anh Đào, Tuấn Trần', 'HKFilm', '', '', 'Câu chuyện về Mai, người phụ nữ ngoài bốn mươi với quá khứ nhiều tổn thương.'),
    (3, 'Quật Mộ Trùng Ma', 134, 'T18', TIMESTAMPADD(DAY, -3, CURRENT_DATE), TIMESTAMPADD(DAY, 20, CURRENT_DATE), 'Jang Jae-hyun', 'Choi Min-sik, Kim Go-eun', 'Showbox', '', '', 'Một gia đình giàu có thuê pháp sư và thầy phong thủy di dời ngôi mộ tổ tiên.'),
    (4, 'Doraemon: Nobita và Bản Giao Hưởng Địa Cầu', 115, 'P', TIMESTAMPADD(DAY, -1, CURRENT_DATE), TIMESTAMPADD(DAY, 30, CURRENT_DATE), 'Imai Kazuaki', 'Mizuta Wasabi, Ohara Megumi', 'Shin-Ei Animation', '', '', 'Nobita và những người bạn cứu thế giới bằng âm nhạc.'),
    (5, 'Phim sắp chiếu (mẫu)', 120, 'T13', TIMESTAMPADD(DAY, 10, CURRENT_DATE), TIMESTAMPADD(DAY, 40, CURRENT_DATE), 'Đang cập nhật', 'Đang cập nhật', 'Đang cập nhật', '', '', 'Phim chưa khởi chiếu, không được hiện trong danh sách đặt vé.'),
    (6, 'Phim đã hết chiếu (mẫu)', 100, 'K', TIMESTAMPADD(DAY, -40, CURRENT_DATE), TIMESTAMPADD(DAY, -1, CURRENT_DATE), 'Đang cập nhật', 'Đang cập nhật', 'Đang cập nhật', '', '', 'Phim đã kết thúc, không được hiện trong danh sách đặt vé.');

INSERT INTO phim_the_loai (phim_id, the_loai_id) VALUES
    (1, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 2), (6, 3);

-- Mỗi phòng 8 hàng A–H, 12 ghế, lối đi sau ghế 03 và 09: cột 1–3, 5–10, 12–14
INSERT INTO ghe (phong_chieu_id, ten_hang, so_ghe, vi_tri_cot, loai_ghe)
SELECT p.id, h.ten, n.so,
       CASE WHEN n.so <= 3 THEN n.so WHEN n.so <= 9 THEN n.so + 1 ELSE n.so + 2 END,
       CASE WHEN h.ten IN ('E', 'F', 'G') AND n.so BETWEEN 4 AND 9 THEN 'VIP' ELSE 'THUONG' END
FROM phong_chieu p
CROSS JOIN (SELECT 'A' AS ten UNION ALL SELECT 'B' UNION ALL SELECT 'C' UNION ALL SELECT 'D'
            UNION ALL SELECT 'E' UNION ALL SELECT 'F' UNION ALL SELECT 'G' UNION ALL SELECT 'H') h
CROSS JOIN (SELECT 1 AS so UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
            UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9 UNION ALL SELECT 10 UNION ALL SELECT 11 UNION ALL SELECT 12) n;

-- Mỗi phòng 5 suất/ngày trong 6 ngày, cách nhau 3 giờ 15 phút; ket_thuc = bat_dau + thời lượng + 15 phút dọn phòng
INSERT INTO suat_chieu (phim_id, phong_chieu_id, bat_dau, ket_thuc)
SELECT f.id, p.id,
       TIMESTAMPADD(MINUTE, d.n * 1440 + s.phut, CURRENT_DATE),
       TIMESTAMPADD(MINUTE, d.n * 1440 + s.phut + f.thoi_luong + 15, CURRENT_DATE)
FROM phong_chieu p
CROSS JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) d
CROSS JOIN (SELECT 0 AS thu_tu, 540 AS phut UNION ALL SELECT 1, 735 UNION ALL SELECT 2, 930
            UNION ALL SELECT 3, 1125 UNION ALL SELECT 4, 1320) s
JOIN phim f ON f.id = MOD(d.n + p.id + s.thu_tu, 4) + 1;
