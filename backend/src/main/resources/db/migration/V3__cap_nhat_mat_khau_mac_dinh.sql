-- ==============================================================================
-- CẬP NHẬT MẬT KHẨU MẶC ĐỊNH CHO TÀI KHOẢN MẪU (Mật khẩu: 123456)
-- Khắc phục lỗi hash BCrypt cũ trong R__sample_data.sql không khớp với 123456
-- Chuẩn BCrypt hash của '123456': $2a$10$S/TmQQBk61EmbX03Rq2B.OdkRjVPjjFLWBodfyNRov1sAsP399wxe
-- ==============================================================================

UPDATE nguoi_dung 
SET mat_khau = '$2a$10$S/TmQQBk61EmbX03Rq2B.OdkRjVPjjFLWBodfyNRov1sAsP399wxe',
    so_lan_dang_nhap_sai = 0,
    bi_khoa = FALSE
WHERE tai_khoan IN ('admin', 'staff_landmark', 'staff_danang', 'hoangnam', 'thanhhang');
