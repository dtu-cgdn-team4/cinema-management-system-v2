package com.cgdn.cinema.modules.pricing.entity;

import java.math.BigDecimal;
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
@Table(name = "bang_gia")
public class TicketPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** ISO: 1 = Thứ hai ... 7 = Chủ nhật. */
    @Column(name = "thu_trong_tuan")
    private Integer dayOfWeek;

    @Enumerated(EnumType.STRING)
    @Column(name = "loai_ghe")
    private SeatType seatType;

    @Column(name = "gia")
    private BigDecimal price;
}
