package com.cgdn.cinema.modules.movie.entity;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;
import com.cgdn.cinema.common.enums.AgeRating;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "phim")
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_phim")
    private String title;

    /** Phút. */
    @Column(name = "thoi_luong")
    private Integer duration;

    @Enumerated(EnumType.STRING)
    @Column(name = "nhan_tuoi")
    private AgeRating ageRating;

    @Column(name = "ngay_khoi_chieu")
    private LocalDate releaseDate;

    @Column(name = "ngay_ket_thuc")
    private LocalDate endDate;

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(name = "noi_dung")
    private String description;

    @Column(name = "trang_thai")
    private Integer status;

    @ManyToMany
    @JoinTable(name = "phim_the_loai",
            joinColumns = @JoinColumn(name = "phim_id"),
            inverseJoinColumns = @JoinColumn(name = "the_loai_id"))
    @OrderBy("id")
    private Set<Genre> genres = new LinkedHashSet<>();
}
