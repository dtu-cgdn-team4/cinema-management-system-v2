-- Đồng bộ các cột trạng thái kiểu INT với kiểu Integer được ánh xạ trong JPA.
ALTER TABLE phim MODIFY trang_thai INT NOT NULL DEFAULT 1;
ALTER TABLE rap MODIFY trang_thai INT NOT NULL DEFAULT 1;
ALTER TABLE phong_chieu MODIFY trang_thai INT NOT NULL DEFAULT 1;
ALTER TABLE ghe MODIFY trang_thai INT NOT NULL DEFAULT 1;
ALTER TABLE suat_chieu MODIFY trang_thai INT NOT NULL DEFAULT 1;
ALTER TABLE nguoi_dung MODIFY trang_thai INT NOT NULL DEFAULT 1;
ALTER TABLE khuyen_mai MODIFY trang_thai INT NOT NULL DEFAULT 1;
