package com.cgdn.cinema.modules.movie.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "phim")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_phim", nullable = false)
    private String tenPhim;

    @Column(name = "thoi_luong", nullable = false)
    private Integer thoiLuong;

    @Column(name = "nhan_tuoi", nullable = false, length = 5)
    private String nhanTuoi;

    @Column(name = "ngay_khoi_chieu", nullable = false)
    private LocalDate ngayKhoiChieu;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "dao_dien", nullable = false)
    private String daoDien;

    @Column(name = "dien_vien", nullable = false, length = 1000)
    private String dienVien;

    @Column(name = "hang_san_xuat", nullable = false)
    private String hangSanXuat;

    @Column(name = "trailer_url", nullable = false, length = 500)
    private String trailerUrl;

    @Column(name = "poster_url", nullable = false, length = 500)
    private String posterUrl;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "trang_thai", nullable = false)
    @Builder.Default
    private Integer trangThai = 1; // 1: Hoạt động, 2: Ngừng chiếu (xóa mềm)

    @CreationTimestamp
    @Column(name = "ngay_tao", updatable = false)
    private LocalDateTime ngayTao;

    @UpdateTimestamp
    @Column(name = "ngay_cap_nhat")
    private LocalDateTime ngayCapNhat;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "phim_the_loai",
        joinColumns = @JoinColumn(name = "phim_id"),
        inverseJoinColumns = @JoinColumn(name = "the_loai_id")
    )
    @Builder.Default
    private Set<Genre> theLoais = new HashSet<>();
}

