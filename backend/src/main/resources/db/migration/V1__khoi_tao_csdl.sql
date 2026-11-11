-- Schema theo docs/database/ERD.jpg. Chạy được trên cả MySQL 8 và H2 chế độ MySQL.
-- Chuỗi dùng VARCHAR: CSDL đã là utf8mb4, NVARCHAR của MySQL lại là utf8mb3.

-- Phim
CREATE TABLE the_loai (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten           VARCHAR(100) NOT NULL UNIQUE,
    ngay_tao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE phim (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_phim        VARCHAR(255) NOT NULL,
    thoi_luong      INT NOT NULL,
    nhan_tuoi       VARCHAR(5) NOT NULL,
    ngay_khoi_chieu DATE NOT NULL,
    ngay_ket_thuc   DATE NOT NULL,
    dao_dien        VARCHAR(255) NOT NULL,
    dien_vien       VARCHAR(1000) NOT NULL,
    hang_san_xuat   VARCHAR(255) NOT NULL,
    trailer_url     VARCHAR(500) NOT NULL,
    poster_url      VARCHAR(500) NOT NULL,
    noi_dung        TEXT NOT NULL,
    trang_thai      TINYINT NOT NULL DEFAULT 1,
    ngay_tao        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE INDEX idx_phim_ngay_chieu ON phim (ngay_khoi_chieu, ngay_ket_thuc);

CREATE TABLE phim_the_loai (
    phim_id       BIGINT NOT NULL,
    the_loai_id   BIGINT NOT NULL,
    ngay_tao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (phim_id, the_loai_id),
    CONSTRAINT fk_ptl_phim FOREIGN KEY (phim_id) REFERENCES phim (id),
    CONSTRAINT fk_ptl_the_loai FOREIGN KEY (the_loai_id) REFERENCES the_loai (id)
);

-- Rạp, phòng, ghế, suất chiếu
CREATE TABLE rap (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_rap       VARCHAR(255) NOT NULL UNIQUE,
    thanh_pho     VARCHAR(100) NOT NULL,
    dia_chi       VARCHAR(500) NOT NULL,
    so_dien_thoai VARCHAR(20) NOT NULL,
    gio_mo_cua    TIME NOT NULL,
    gio_dong_cua  TIME NOT NULL,
    hinh_anh_url  VARCHAR(500) NOT NULL,
    trang_thai    TINYINT NOT NULL DEFAULT 1,
    ngay_tao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE phong_chieu (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    rap_id        BIGINT NOT NULL,
    ten_phong     VARCHAR(50) NOT NULL,
    so_hang       INT NOT NULL,
    so_cot        INT NOT NULL,
    trang_thai    TINYINT NOT NULL DEFAULT 1,
    ngay_tao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_phong_chieu UNIQUE (rap_id, ten_phong),
    CONSTRAINT fk_phong_rap FOREIGN KEY (rap_id) REFERENCES rap (id)
);

CREATE TABLE ghe (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    phong_chieu_id BIGINT NOT NULL,
    ten_hang       VARCHAR(5) NOT NULL,
    so_ghe         INT NOT NULL,
    vi_tri_cot     INT NOT NULL,
    loai_ghe       VARCHAR(10) NOT NULL,
    trang_thai     TINYINT NOT NULL DEFAULT 1,
    ngay_tao       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_ghe UNIQUE (phong_chieu_id, ten_hang, so_ghe),
    CONSTRAINT fk_ghe_phong FOREIGN KEY (phong_chieu_id) REFERENCES phong_chieu (id)
);

CREATE TABLE suat_chieu (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    phim_id        BIGINT NOT NULL,
    phong_chieu_id BIGINT NOT NULL,
    bat_dau        DATETIME NOT NULL,
    ket_thuc       DATETIME NOT NULL, -- đã cộng thời gian dọn phòng
    trang_thai     TINYINT NOT NULL DEFAULT 1,
    ngay_tao       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sc_phim FOREIGN KEY (phim_id) REFERENCES phim (id),
    CONSTRAINT fk_sc_phong FOREIGN KEY (phong_chieu_id) REFERENCES phong_chieu (id)
);
CREATE INDEX idx_sc_phim_bat_dau ON suat_chieu (phim_id, bat_dau);
CREATE INDEX idx_sc_phong_bat_dau ON suat_chieu (phong_chieu_id, bat_dau);

-- Giá: thu_trong_tuan theo ISO, 1 = Thứ hai ... 7 = Chủ nhật
CREATE TABLE bang_gia (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    thu_trong_tuan TINYINT NOT NULL,
    loai_ghe       VARCHAR(10) NOT NULL,
    gia            DECIMAL(12, 0) NOT NULL,
    ngay_tao       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_bang_gia UNIQUE (thu_trong_tuan, loai_ghe)
);

-- Giá tạm ghế thường (SRS 6.8). Giá VIP chưa chốt.
INSERT INTO bang_gia (thu_trong_tuan, loai_ghe, gia) VALUES
    (1, 'THUONG', 50000), (2, 'THUONG', 45000), (3, 'THUONG', 50000), (4, 'THUONG', 50000),
    (5, 'THUONG', 65000), (6, 'THUONG', 65000), (7, 'THUONG', 65000);

-- Người dùng
CREATE TABLE nguoi_dung (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    tai_khoan            VARCHAR(100) NOT NULL UNIQUE,
    mat_khau             VARCHAR(255) NOT NULL,
    ho_ten               VARCHAR(255) NOT NULL,
    email                VARCHAR(255) NOT NULL UNIQUE,
    so_dien_thoai        VARCHAR(20) NOT NULL UNIQUE,
    ngay_sinh            DATE NOT NULL,
    gioi_tinh            VARCHAR(10) NOT NULL,
    cccd                 VARCHAR(12) NULL,
    dia_chi              VARCHAR(500) NULL,
    vai_tro              VARCHAR(20) NOT NULL,
    rap_id               BIGINT NULL,
    google_id            VARCHAR(255) NULL,
    diem_tich_luy        INT NOT NULL DEFAULT 0,
    so_lan_dang_nhap_sai INT NOT NULL DEFAULT 0,
    bi_khoa              BOOLEAN NOT NULL DEFAULT FALSE,
    trang_thai           TINYINT NOT NULL DEFAULT 1,
    ngay_tao             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_nguoi_dung_rap FOREIGN KEY (rap_id) REFERENCES rap (id),
    CONSTRAINT ck_nguoi_dung_rap CHECK (
        (vai_tro = 'NHAN_VIEN' AND rap_id IS NOT NULL) OR (vai_tro <> 'NHAN_VIEN' AND rap_id IS NULL)
    )
);

-- Khuyến mãi
CREATE TABLE khuyen_mai (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    ma              VARCHAR(50) NULL UNIQUE,
    tieu_de         VARCHAR(255) NOT NULL,
    noi_dung        TEXT NOT NULL,
    hinh_anh_url    VARCHAR(500) NOT NULL,
    loai_giam       VARCHAR(20) NOT NULL,
    muc_giam        DECIMAL(12, 0) NOT NULL,
    bat_dau         DATETIME NOT NULL,
    ket_thuc        DATETIME NOT NULL,
    tu_dong_ap_dung BOOLEAN NOT NULL DEFAULT FALSE,
    trang_thai      TINYINT NOT NULL DEFAULT 1,
    ngay_tao        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE khuyen_mai_thu (
    khuyen_mai_id  BIGINT NOT NULL,
    thu_trong_tuan TINYINT NOT NULL,
    ngay_tao       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (khuyen_mai_id, thu_trong_tuan),
    CONSTRAINT fk_kmt_khuyen_mai FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai (id)
);

-- Đặt vé
CREATE TABLE dat_ve (
    id                BIGINT AUTO_INCREMENT PRIMARY KEY,
    ma_dat_ve         VARCHAR(50) NOT NULL UNIQUE,
    nguoi_dung_id     BIGINT NULL,
    suat_chieu_id     BIGINT NOT NULL,
    kenh              VARCHAR(20) NOT NULL,
    nhan_vien_id      BIGINT NULL,
    ten_nguoi_nhan    VARCHAR(255) NULL,
    sdt_nguoi_nhan    VARCHAR(20) NULL,
    email_nguoi_nhan  VARCHAR(255) NULL,
    khuyen_mai_id     BIGINT NULL,
    tong_tien         DECIMAL(12, 0) NOT NULL,
    tien_giam         DECIMAL(12, 0) NOT NULL,
    thanh_tien        DECIMAL(12, 0) NOT NULL,
    trang_thai_dat_ve VARCHAR(20) NOT NULL,
    thanh_toan_luc    DATETIME NOT NULL,
    nhan_ve_luc       DATETIME NULL,
    ngay_tao          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dat_ve_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id),
    CONSTRAINT fk_dat_ve_suat_chieu FOREIGN KEY (suat_chieu_id) REFERENCES suat_chieu (id),
    CONSTRAINT fk_dat_ve_nhan_vien FOREIGN KEY (nhan_vien_id) REFERENCES nguoi_dung (id),
    CONSTRAINT fk_dat_ve_khuyen_mai FOREIGN KEY (khuyen_mai_id) REFERENCES khuyen_mai (id),
    CONSTRAINT ck_dat_ve_kenh CHECK (
        (kenh = 'ONLINE' AND nguoi_dung_id IS NOT NULL AND nhan_vien_id IS NULL
            AND ten_nguoi_nhan IS NOT NULL AND sdt_nguoi_nhan IS NOT NULL AND email_nguoi_nhan IS NOT NULL)
        OR (kenh = 'TAI_QUAY' AND nhan_vien_id IS NOT NULL)
    )
);
CREATE INDEX idx_dat_ve_sdt ON dat_ve (sdt_nguoi_nhan);

-- Trạng thái từng ghế trong một suất. Ghế không có bản ghi là ghế trống.
CREATE TABLE ghe_suat_chieu (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    suat_chieu_id  BIGINT NOT NULL,
    ghe_id         BIGINT NOT NULL,
    nguoi_dung_id  BIGINT NULL,
    dat_ve_id      BIGINT NULL,
    gia            DECIMAL(12, 0) NULL,
    trang_thai_ghe VARCHAR(20) NOT NULL, -- DANG_GIU, CHO_THANH_TOAN, DA_THANH_TOAN
    het_han_luc    DATETIME NULL,        -- chỉ dùng khi DANG_GIU
    ngay_tao       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_ghe_suat_chieu UNIQUE (suat_chieu_id, ghe_id), -- chặn bán trùng
    CONSTRAINT fk_gsc_suat_chieu FOREIGN KEY (suat_chieu_id) REFERENCES suat_chieu (id),
    CONSTRAINT fk_gsc_ghe FOREIGN KEY (ghe_id) REFERENCES ghe (id),
    CONSTRAINT fk_gsc_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id),
    CONSTRAINT fk_gsc_dat_ve FOREIGN KEY (dat_ve_id) REFERENCES dat_ve (id)
);
CREATE INDEX idx_gsc_nguoi_dung ON ghe_suat_chieu (nguoi_dung_id, suat_chieu_id);
CREATE INDEX idx_gsc_het_han ON ghe_suat_chieu (trang_thai_ghe, het_han_luc); -- job nhả ghế quá hạn

-- Thanh toán, hóa đơn, điểm
CREATE TABLE thanh_toan (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    dat_ve_id             BIGINT NOT NULL,
    phuong_thuc           VARCHAR(20) NOT NULL,
    so_tien               DECIMAL(12, 0) NOT NULL,
    ma_giao_dich          VARCHAR(100) NOT NULL,
    trang_thai_thanh_toan VARCHAR(20) NOT NULL,
    thoi_diem             DATETIME NOT NULL,
    ngay_tao              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_thanh_toan_dat_ve FOREIGN KEY (dat_ve_id) REFERENCES dat_ve (id)
);

CREATE TABLE hoa_don (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    dat_ve_id     BIGINT NOT NULL,
    so_hoa_don    VARCHAR(50) NOT NULL,
    ngay_xuat     DATETIME NOT NULL,
    ngay_tao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_hoa_don_dat_ve FOREIGN KEY (dat_ve_id) REFERENCES dat_ve (id)
);

CREATE TABLE lich_su_diem (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    nguoi_dung_id BIGINT NOT NULL,
    dat_ve_id     BIGINT NOT NULL,
    so_diem       INT NOT NULL,
    loai          VARCHAR(10) NOT NULL,
    ngay_tao      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ngay_cap_nhat DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lsd_nguoi_dung FOREIGN KEY (nguoi_dung_id) REFERENCES nguoi_dung (id),
    CONSTRAINT fk_lsd_dat_ve FOREIGN KEY (dat_ve_id) REFERENCES dat_ve (id)
);
