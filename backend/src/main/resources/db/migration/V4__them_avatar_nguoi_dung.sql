-- Thêm cột avatar_url để lưu ảnh đại diện người dùng (Google avatar hoặc ảnh tùy chỉnh)
-- Tương thích cả MySQL 8 và H2 chế độ MySQL
ALTER TABLE nguoi_dung ADD COLUMN avatar_url VARCHAR(500) NULL;
