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

    @Column(name = "ten_phim", nullable = false, length = 255)
    private String tenPhim;

    @Column(name = "thoi_luong", nullable = false)
    private Integer thoiLuong;

    @Column(name = "nhan_tuoi", nullable = false, length = 5)
    private String nhanTuoi;

    @Column(name = "ngay_khoi_chieu", nullable = false)
    private LocalDate ngayKhoiChieu;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate ngayKetThuc;

    @Column(name = "dao_dien", nullable = false, length = 255)
    private String daoDien;

    @Column(name = "dien_vien", nullable = false, length = 1000)
    private String dienVien;

    @Column(name = "hang_san_xuat", nullable = false, length = 255)
    private String hangSanXuat;

    @Column(name = "trailer_url", nullable = false, length = 500)
    private String trailerUrl;

    @Column(name = "poster_url", nullable = false, length = 500)
    private String posterUrl;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "trang_thai", nullable = false, columnDefinition = "TINYINT")
    @Builder.Default
    private Integer trangThai = 1; // 1: Active, 2: Deleted

    @CreationTimestamp
    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime ngayTao;

    @UpdateTimestamp
    @Column(name = "ngay_cap_nhat", nullable = false)
    private LocalDateTime ngayCapNhat;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "phim_the_loai",
        joinColumns = @JoinColumn(name = "phim_id", referencedColumnName = "id"),
        inverseJoinColumns = @JoinColumn(name = "the_loai_id", referencedColumnName = "id")
    )
    @Builder.Default
    private Set<Genre> theLoai = new HashSet<>();

    public void addGenre(Genre genre) {
        this.theLoai.add(genre);
        genre.getDanhSachPhim().add(this);
    }

    public void removeGenre(Genre genre) {
        this.theLoai.remove(genre);
        genre.getDanhSachPhim().remove(this);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Movie movie)) return false;
        return id != null && id.equals(movie.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
