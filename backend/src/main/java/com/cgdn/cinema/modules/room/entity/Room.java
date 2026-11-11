package com.cgdn.cinema.modules.room.entity;

import com.cgdn.cinema.modules.cinema.entity.Cinema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "phong_chieu")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rap_id")
    private Cinema cinema;

    @Column(name = "ten_phong")
    private String name;

    @Column(name = "so_hang")
    private Integer rowCount;

    @Column(name = "so_cot")
    private Integer columnCount;

    @Column(name = "trang_thai")
    private Integer status;
}
