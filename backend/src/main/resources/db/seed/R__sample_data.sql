-- ==============================================================================
-- DỮ LIỆU MẪU HỆ THỐNG RẠP CHIẾU PHIM (GALAXY LUMIÈRE CINEMA)
-- Khớp 100% với sơ đồ ERD, tài liệu docs/database/database.md và giao diện Figma.
-- Dữ liệu thực tế tại thị trường Việt Nam (TP. Hồ Chí Minh & TP. Đà Nẵng).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. THỂ LOẠI PHIM (the_loai)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO the_loai (id, ten) VALUES
    (1, 'Hành động'),
    (2, 'Khoa học viễn tưởng'),
    (3, 'Hài hước'),
    (4, 'Tâm lý'),
    (5, 'Kinh dị'),
    (6, 'Hoạt hình'),
    (7, 'Tình cảm'),
    (8, 'Phiêu lưu');

-- ------------------------------------------------------------------------------
-- 2. HỆ THỐNG CỤM RẠP (rap) - Chuẩn Figma & Thực tế tại Việt Nam
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai, gio_mo_cua, gio_dong_cua, hinh_anh_url, trang_thai) VALUES
    (1, 'Lumière Landmark 81', 'TP. Hồ Chí Minh', 'Tầng B1, TTTM Vincom Center Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh', '02873002222', '08:00:00', '23:30:00', 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1000', 1),
    (2, 'Lumière Nguyễn Du', 'TP. Hồ Chí Minh', '116 Nguyễn Du, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh', '02838234567', '08:30:00', '23:30:00', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1000', 1),
    (3, 'Lumière Đà Nẵng Center', 'Đà Nẵng', 'Tầng 3, TTTM Vincom Plaza Ngô Quyền, 910A Ngô Quyền, Phường An Hải Bắc, Quận Sơn Trà, TP. Đà Nẵng', '02363996688', '08:30:00', '23:00:00', 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=1000', 1),
    (4, 'Lumière Quang Trung', 'TP. Hồ Chí Minh', '190 Quang Trung, Phường 10, Quận Gò Vấp, TP. Hồ Chí Minh', '02838941234', '08:00:00', '23:00:00', 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1000', 1);

-- ------------------------------------------------------------------------------
-- 3. DANH SÁCH PHIM (phim) - Các phim chiếu rạp đình đám thực tế trên Figma
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc, dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung, trang_thai) VALUES
    (1, 'Dune: Hành Tinh Cát — Phần 2', 166, 'T16', '2026-03-01', '2026-12-31', 'Denis Villeneuve', 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler', 'Warner Bros. Pictures', 'https://www.youtube.com/watch?v=Way9Dexny3w', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800', 'Paul Atreides hợp lực cùng Chani và tộc người Fremen để trả thù những kẻ đã hủy hoại gia đình mình, đồng thời đối mặt với lựa chọn giữa tình yêu và số phận vũ trụ.', 1),
    (2, 'Deadpool & Wolverine', 128, 'T18', '2026-07-26', '2026-12-31', 'Shawn Levy', 'Ryan Reynolds, Hugh Jackman, Emma Corrin, Matthew Macfadyen', 'Marvel Studios', 'https://www.youtube.com/watch?v=73_1biulkYk', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800', 'Wade Wilson tái xuất trong bộ đồ Deadpool và buộc phải thuyết phục Wolverine hợp tác để bảo vệ dòng thời gian và cứu lấy thế giới của anh.', 1),
    (3, 'Mai (2024)', 131, 'T18', '2026-02-10', '2026-12-31', 'Trấn Thành', 'Phương Anh Đào, Tuấn Trần, Trấn Thành, Hồng Đào, Uyển Ân', 'CJ HK Entertainment', 'https://www.youtube.com/watch?v=d_kFvP35mO8', 'https://images.unsplash.com/photo-1518676599649-7c7e30d31efb?w=800', 'Mai là một phụ nữ ngoài 30 tuổi làm nghề mát-xa chịu nhiều định kiến xã hội. Cuộc đời cô rẽ sang trang mới khi gặp Dương, chàng trai trẻ phong lưu hết lòng theo đuổi cô.', 1),
    (4, 'Quật Mộ Trùng Ma', 134, 'T18', '2026-03-15', '2026-12-31', 'Jang Jae-hyun', 'Choi Min-sik, Kim Go-eun, Yoo Hae-jin, Lee Do-hyun', 'Showbox', 'https://www.youtube.com/watch?v=kYJ0i-f5r-Y', 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800', 'Hai pháp sư, một thầy phong thủy và một chuyên gia tang lễ nhận lời khai quật một ngôi mộ cổ bí ẩn tại vùng hẻo lánh, vô tình giải phóng một thế lực tà ác cổ xưa.', 1),
    (5, 'Oppenheimer: Kẻ Huỷ Diệt', 180, 'T18', '2026-08-11', '2026-12-31', 'Christopher Nolan', 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh', 'Universal Pictures', 'https://www.youtube.com/watch?v=uYPbbksJxIg', 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800', 'Câu chuyện chân thực về nhà vật lý lý thuyết J. Robert Oppenheimer, người đứng đầu Dự án Manhattan khai sinh ra quả bom nguyên tử đầu tiên trong lịch sử nhân loại.', 1),
    (6, 'Lật Mặt 7: Một Điều Ước', 138, 'K', '2026-04-26', '2026-12-31', 'Lý Hải', 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung, Quách Ngọc Tuyên, Trâm Anh', 'Lý Hải Production', 'https://www.youtube.com/watch?v=QfV7b_5sXbE', 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', 'Bà Hai 73 tuổi sống một mình tại làng quê Lâm Đồng. Biến cố xảy ra khi bà bị tai nạn gãy chân, đặt 5 người con trưởng thành vào bài toán ai sẽ là người chăm sóc mẹ già.', 1);

-- ------------------------------------------------------------------------------
-- 4. LIÊN KẾT PHIM - THỂ LOẠI (phim_the_loai)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO phim_the_loai (phim_id, the_loai_id) VALUES
    (1, 1), (1, 2), -- Dune 2: Hành động, Khoa học viễn tưởng
    (2, 1), (2, 3), -- Deadpool & Wolverine: Hành động, Hài hước
    (3, 4), (3, 7), -- Mai: Tâm lý, Tình cảm
    (4, 5), (4, 1), -- Quật Mộ Trùng Ma: Kinh dị, Hành động
    (5, 4), (5, 2), -- Oppenheimer: Tâm lý, Khoa học viễn tưởng
    (6, 4), (6, 3); -- Lật Mặt 7: Tâm lý, Hài hước

-- ------------------------------------------------------------------------------
-- 5. BỔ SUNG BẢNG GIÁ GHẾ VIP (bang_gia)
-- Lưu ý: Ghế THUONG đã có ở V1 (T2-T5: 50k, T3: 45k, T6-CN: 65k).
-- Ở đây chỉ bổ sung loại ghế VIP (thực tế chênh lệch +20.000đ tại rạp VN).
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO bang_gia (thu_trong_tuan, loai_ghe, gia) VALUES
    (1, 'VIP', 70000), -- Thứ 2
    (2, 'VIP', 65000), -- Thứ 3 (Ngày hội giá vé rẻ)
    (3, 'VIP', 70000), -- Thứ 4
    (4, 'VIP', 70000), -- Thứ 5
    (5, 'VIP', 85000), -- Thứ 6
    (6, 'VIP', 85000), -- Thứ 7 (Cuối tuần)
    (7, 'VIP', 85000); -- Chủ nhật (Cuối tuần)

-- ------------------------------------------------------------------------------
-- 6. CHƯƠNG TRÌNH KHUYẾN MÃI (khuyen_mai & khuyen_mai_thu)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO khuyen_mai (id, ma, tieu_de, noi_dung, hinh_anh_url, loai_giam, muc_giam, bat_dau, ket_thuc, tu_dong_ap_dung, trang_thai) VALUES
    (1, NULL, 'Thứ 3 Vui Vẻ — Giảm 10.000 đ/vé', 'Mỗi thứ Ba hằng tuần, mọi suất chiếu được giảm 10.000 đ/vé, trừ thẳng vào tiền vé khi đặt online hoặc mua tại quầy.', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', 'SO_TIEN', 10000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE, 1),
    (2, 'MEMBER15', 'Thành viên nhập mã giảm 15.000 đ/vé', 'Dành riêng cho khách hàng thành viên có tài khoản Lumière Cinema khi đặt vé xem phim trực tuyến.', 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800', 'SO_TIEN', 15000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', FALSE, 1),
    (3, 'HSSV20', 'Học sinh sinh viên giảm 20% tiền vé', 'Ưu đãi 20% trên tổng hóa đơn vé xem phim cho học sinh, sinh viên xuất trình thẻ sinh viên hợp lệ.', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800', 'PHAN_TRAM', 20, '2026-01-01 00:00:00', '2026-12-31 23:59:59', FALSE, 1),
    (4, 'WEEKEND5', 'Cuối tuần nhập mã giảm 5.000 đ/vé', 'Nhập mã WEEKEND5 giảm ngay 5.000 đ/vé cho các suất chiếu Thứ 6, Thứ 7 và Chủ nhật.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', 'SO_TIEN', 5000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', FALSE, 1),
    (5, 'PAYPAL10', 'Thanh toán ví PayPal giảm 10.000 đ', 'Giảm trực tiếp 10.000 đ cho khách hàng hoàn tất thanh toán vé trực tuyến qua cổng PayPal.', 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800', 'SO_TIEN', 10000, '2026-01-01 00:00:00', '2026-12-31 23:59:59', FALSE, 1);

-- Áp dụng thứ cho khuyến mãi:
INSERT IGNORE INTO khuyen_mai_thu (khuyen_mai_id, thu_trong_tuan) VALUES
    (1, 2),          -- KM Thứ 3 vui vẻ: chỉ áp dụng Thứ 3 (giá trị 2)
    (4, 5), (4, 6), (4, 7); -- KM Cuối tuần: Thứ 6, Thứ 7, Chủ nhật

-- ------------------------------------------------------------------------------
-- 7. TÀI KHOẢN NGƯỜI DÙNG (nguoi_dung) - Mật khẩu mặc định: 123456
-- Chuẩn BCrypt hash: $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO nguoi_dung (id, tai_khoan, mat_khau, ho_ten, email, so_dien_thoai, ngay_sinh, gioi_tinh, cccd, dia_chi, vai_tro, rap_id, diem_tich_luy, trang_thai) VALUES
    -- Quản trị viên hệ thống (rap_id bắt buộc NULL theo CHECK constraint)
    (1, 'admin', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'Nguyễn Minh Nguyên', 'admin@lumiere.vn', '0905111222', '2002-05-15', 'Nam', '048099001122', 'Hải Châu, TP. Đà Nẵng', 'ADMIN', NULL, 0, 1),

    -- Nhân viên rạp Lumière Landmark 81 (rap_id bắt buộc = 1 theo CHECK constraint)
    (2, 'staff_landmark', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'Trần Văn Long', 'longtv@lumiere.vn', '0905222333', '2003-08-20', 'Nam', '048099002233', 'Bình Thạnh, TP. Hồ Chí Minh', 'NHAN_VIEN', 1, 0, 1),

    -- Nhân viên rạp Lumière Đà Nẵng Center (rap_id bắt buộc = 3 theo CHECK constraint)
    (3, 'staff_danang', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'Nguyễn Vinh Hà', 'hanv@lumiere.vn', '0905333444', '2003-11-10', 'Nam', '048099003344', 'Sơn Trà, TP. Đà Nẵng', 'NHAN_VIEN', 3, 0, 1),

    -- Khách hàng mẫu 1 (rap_id bắt buộc NULL theo CHECK constraint)
    (4, 'hoangnam', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'Lê Hoàng Nam', 'hoangnam@gmail.com', '0914555666', '2001-03-25', 'Nam', '048099004455', 'Quận 1, TP. Hồ Chí Minh', 'KHACH_HANG', NULL, 150, 1),

    -- Khách hàng mẫu 2 (rap_id bắt buộc NULL theo CHECK constraint)
    (5, 'thanhhang', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.0FxO/BTk76klW', 'Nguyễn Thị Thanh Hằng', 'thanhhang@gmail.com', '0988777888', '2004-09-12', 'Nữ', '048099005566', 'Hải Châu, TP. Đà Nẵng', 'KHACH_HANG', NULL, 50, 1);

-- ------------------------------------------------------------------------------
-- 8. PHÒNG CHIẾU (phong_chieu)
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO phong_chieu (id, rap_id, ten_phong, so_hang, so_cot, trang_thai) VALUES
    (1, 1, 'Cinema 01 (2D Standard)', 5, 8, 1), -- Rạp Landmark 81: 5 hàng x 8 cột = 40 ghế
    (2, 1, 'Cinema 02 (VIP Premiere)', 6, 10, 1), -- Rạp Landmark 81: 6 hàng x 10 cột = 60 ghế
    (3, 2, 'Cinema 01', 5, 8, 1),                -- Rạp Nguyễn Du
    (4, 3, 'Cinema 01 (2D Dragon)', 5, 8, 1);    -- Rạp Đà Nẵng Center

-- ------------------------------------------------------------------------------
-- 9. MA TRẬN GHẾ (ghe) - Tạo 40 ghế cho Phòng 1 (Landmark 81)
-- Hàng A, B, C: Ghế THUONG. Hàng D, E: Ghế VIP
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO ghe (phong_chieu_id, ten_hang, so_ghe, vi_tri_cot, loai_ghe, trang_thai) VALUES
    -- Hàng A (Ghế thường)
    (1, 'A', 1, 1, 'THUONG', 1), (1, 'A', 2, 2, 'THUONG', 1), (1, 'A', 3, 3, 'THUONG', 1), (1, 'A', 4, 4, 'THUONG', 1),
    (1, 'A', 5, 5, 'THUONG', 1), (1, 'A', 6, 6, 'THUONG', 1), (1, 'A', 7, 7, 'THUONG', 1), (1, 'A', 8, 8, 'THUONG', 1),
    -- Hàng B (Ghế thường)
    (1, 'B', 1, 1, 'THUONG', 1), (1, 'B', 2, 2, 'THUONG', 1), (1, 'B', 3, 3, 'THUONG', 1), (1, 'B', 4, 4, 'THUONG', 1),
    (1, 'B', 5, 5, 'THUONG', 1), (1, 'B', 6, 6, 'THUONG', 1), (1, 'B', 7, 7, 'THUONG', 1), (1, 'B', 8, 8, 'THUONG', 1),
    -- Hàng C (Ghế thường)
    (1, 'C', 1, 1, 'THUONG', 1), (1, 'C', 2, 2, 'THUONG', 1), (1, 'C', 3, 3, 'THUONG', 1), (1, 'C', 4, 4, 'THUONG', 1),
    (1, 'C', 5, 5, 'THUONG', 1), (1, 'C', 6, 6, 'THUONG', 1), (1, 'C', 7, 7, 'THUONG', 1), (1, 'C', 8, 8, 'THUONG', 1),
    -- Hàng D (Ghế VIP)
    (1, 'D', 1, 1, 'VIP', 1), (1, 'D', 2, 2, 'VIP', 1), (1, 'D', 3, 3, 'VIP', 1), (1, 'D', 4, 4, 'VIP', 1),
    (1, 'D', 5, 5, 'VIP', 1), (1, 'D', 6, 6, 'VIP', 1), (1, 'D', 7, 7, 'VIP', 1), (1, 'D', 8, 8, 'VIP', 1),
    -- Hàng E (Ghế VIP)
    (1, 'E', 1, 1, 'VIP', 1), (1, 'E', 2, 2, 'VIP', 1), (1, 'E', 3, 3, 'VIP', 1), (1, 'E', 4, 4, 'VIP', 1),
    (1, 'E', 5, 5, 'VIP', 1), (1, 'E', 6, 6, 'VIP', 1), (1, 'E', 7, 7, 'VIP', 1), (1, 'E', 8, 8, 'VIP', 1);

-- ------------------------------------------------------------------------------
-- 10. SUẤT CHIẾU MẪU (suat_chieu) - Các khung giờ chiếu sáng, chiều, tối
-- Dùng hàm DATE_ADD để luôn có lịch chiếu từ hôm nay đến 2 ngày tới
-- ------------------------------------------------------------------------------
INSERT IGNORE INTO suat_chieu (id, phim_id, phong_chieu_id, bat_dau, ket_thuc, trang_thai) VALUES
    -- Hôm nay: Phim Dune 2 tại Phòng 1 (Landmark 81)
    (1, 1, 1, CONCAT(CURRENT_DATE(), ' 09:30:00'), CONCAT(CURRENT_DATE(), ' 12:30:00'), 1),
    -- Hôm nay: Phim Deadpool & Wolverine tại Phòng 1
    (2, 2, 1, CONCAT(CURRENT_DATE(), ' 13:30:00'), CONCAT(CURRENT_DATE(), ' 16:00:00'), 1),
    -- Hôm nay: Phim Mai tại Phòng 1 (Khung giờ vàng tối)
    (3, 3, 1, CONCAT(CURRENT_DATE(), ' 17:00:00'), CONCAT(CURRENT_DATE(), ' 19:30:00'), 1),
    -- Hôm nay: Phim Quật Mộ Trùng Ma tại Phòng 1 (Suất tối muộn)
    (4, 4, 1, CONCAT(CURRENT_DATE(), ' 20:30:00'), CONCAT(CURRENT_DATE(), ' 23:00:00'), 1),

    -- Ngày mai: Lịch chiếu tiếp theo
    (5, 1, 1, CONCAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), ' 10:00:00'), CONCAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), ' 13:00:00'), 1),
    (6, 6, 1, CONCAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), ' 14:00:00'), CONCAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), ' 16:40:00'), 1),
    (7, 2, 1, CONCAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), ' 19:00:00'), CONCAT(DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY), ' 21:30:00'), 1);
