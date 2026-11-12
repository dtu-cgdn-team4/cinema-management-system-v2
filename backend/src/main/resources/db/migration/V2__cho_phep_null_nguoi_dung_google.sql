-- Cho phép người dùng đăng nhập lần đầu bằng Google khi chưa có mật khẩu, SĐT, ngày sinh, giới tính.
-- Chạy được trên cả MySQL 8 và H2 chế độ MySQL.
ALTER TABLE nguoi_dung MODIFY COLUMN mat_khau VARCHAR(255) NULL;
ALTER TABLE nguoi_dung MODIFY COLUMN so_dien_thoai VARCHAR(20) NULL;
ALTER TABLE nguoi_dung MODIFY COLUMN ngay_sinh DATE NULL;
ALTER TABLE nguoi_dung MODIFY COLUMN gioi_tinh VARCHAR(10) NULL;
ALTER TABLE nguoi_dung ADD CONSTRAINT uq_nguoi_dung_google_id UNIQUE (google_id);

