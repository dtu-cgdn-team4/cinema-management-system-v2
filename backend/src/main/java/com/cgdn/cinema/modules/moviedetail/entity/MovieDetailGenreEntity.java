package com.cgdn.cinema.modules.moviedetail.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

@Entity
@Table(name = "the_loai")
@Immutable
@Getter
@Setter
@NoArgsConstructor
public class MovieDetailGenreEntity {

    @Id
    private Long id;

    @Column(name = "ten", nullable = false, unique = true, length = 100)
    private String name;
}
