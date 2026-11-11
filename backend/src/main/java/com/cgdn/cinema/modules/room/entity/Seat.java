package com.cgdn.cinema.modules.room.entity;

import com.cgdn.cinema.common.enums.SeatType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "ghe")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phong_chieu_id")
    private Long roomId;

    @Column(name = "ten_hang")
    private String rowName;

    @Column(name = "so_ghe")
    private Integer number;

    /** Cột trên lưới; cột trống là lối đi. */
    @Column(name = "vi_tri_cot")
    private Integer gridColumn;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_ghe")
    private SeatType type;

    @Column(name = "trang_thai")
    private Integer status;
}
