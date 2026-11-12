package com.cgdn.cinema.modules.movie.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "the_loai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten", nullable = false, unique = true, length = 100)
    private String ten;
}

