package com.cgdn.cinema.modules.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "nguoi_dung")
public class NguoiDung {
    protected NguoiDung() {
    }

    public NguoiDung(String taiKhoan, String matKhau, String hoTen, String email,
                     String soDienThoai, LocalDate ngaySinh, String gioiTinh,
                     String cccd, String diaChi) {
        this.taiKhoan = taiKhoan;
        this.matKhau = matKhau;
        this.hoTen = hoTen;
        this.email = email;
        this.soDienThoai = soDienThoai;
        this.ngaySinh = ngaySinh;
        this.gioiTinh = gioiTinh;
        this.cccd = cccd;
        this.diaChi = diaChi;
        this.vaiTro = "KHACH_HANG";
        this.diemTichLuy = 0;
        this.soLanDangNhapSai = 0;
        this.biKhoa = false;
        this.trangThai = 1;
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "tai_khoan", nullable = false, unique = true, length = 100)
    private String taiKhoan;

    @Column(name = "mat_khau", nullable = false, length = 255)
    private String matKhau;

    @Column(name = "ho_ten", nullable = false, length = 255)
    private String hoTen;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "so_dien_thoai", nullable = false, unique = true, length = 20)
    private String soDienThoai;

    @Column(name = "ngay_sinh", nullable = false)
    private LocalDate ngaySinh;

    @Column(name = "gioi_tinh", nullable = false, length = 10)
    private String gioiTinh;

    @Column(name = "cccd", length = 12)
    private String cccd;

    @Column(name = "dia_chi", length = 500)
    private String diaChi;

    @Column(name = "vai_tro", nullable = false, length = 20)
    private String vaiTro;

    @Column(name = "rap_id")
    private Long rapId;

    @Column(name = "google_id", length = 255)
    private String googleId;

    @Column(name = "diem_tich_luy", nullable = false)
    private Integer diemTichLuy;

    @Column(name = "so_lan_dang_nhap_sai", nullable = false)
    private Integer soLanDangNhapSai;

    @Column(name = "bi_khoa", nullable = false)
    private Boolean biKhoa;

    @Column(name = "trang_thai", nullable = false)
    private Byte trangThai;

    public Long getId() {
        return id;
    }

    public String getTaiKhoan() {
        return taiKhoan;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public String getHoTen() {
        return hoTen;
    }

    public String getEmail() {
        return email;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public LocalDate getNgaySinh() {
        return ngaySinh;
    }

    public String getGioiTinh() {
        return gioiTinh;
    }

    public String getCccd() {
        return cccd;
    }

    public String getDiaChi() {
        return diaChi;
    }

    public String getVaiTro() {
        return vaiTro;
    }

    public Long getRapId() {
        return rapId;
    }

    public String getGoogleId() {
        return googleId;
    }

    public Integer getDiemTichLuy() {
        return diemTichLuy;
    }

    public Integer getSoLanDangNhapSai() {
        return soLanDangNhapSai;
    }

    public Boolean getBiKhoa() {
        return biKhoa;
    }

    public Byte getTrangThai() {
        return trangThai;
    }
}
