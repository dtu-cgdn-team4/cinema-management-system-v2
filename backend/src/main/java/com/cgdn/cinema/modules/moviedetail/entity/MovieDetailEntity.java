package com.cgdn.cinema.modules.moviedetail.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "phim")
@Immutable
@Getter
@Setter
@NoArgsConstructor
public class MovieDetailEntity {

    @Id
    private Long id;

    @Column(name = "ten_phim", nullable = false)
    private String title;

    @Column(name = "poster_url", nullable = false, length = 500)
    private String posterUrl;

    @Column(name = "dao_dien", nullable = false)
    private String director;

    @Column(name = "dien_vien", nullable = false, length = 1000)
    private String actors;

    @Column(name = "thoi_luong", nullable = false)
    private Integer duration;

    @Column(name = "ngay_khoi_chieu", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDate endDate;

    @Column(name = "hang_san_xuat", nullable = false)
    private String productionCompany;

    @Column(name = "nhan_tuoi", nullable = false, length = 5)
    private String ageRating;

    @Column(name = "noi_dung", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "trailer_url", nullable = false, length = 500)
    private String trailerUrl;

    @Column(name = "trang_thai", nullable = false)
    private Byte status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "phim_the_loai",
            joinColumns = @JoinColumn(name = "phim_id"),
            inverseJoinColumns = @JoinColumn(name = "the_loai_id"))
    @OrderBy("id ASC")
    @Immutable
    private List<MovieDetailGenreEntity> genres = new ArrayList<>();
}
