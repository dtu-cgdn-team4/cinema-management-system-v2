package com.cgdn.cinema.modules.booking.entity;

import java.time.LocalDateTime;
import com.cgdn.cinema.common.enums.SeatStatus;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/** Một ghế đang giữ hoặc đã bán trong một suất chiếu (bảng ghe_suat_chieu). */
@Getter
@Setter
@Entity
@Table(name = "ghe_suat_chieu")
public class SeatHold {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "suat_chieu_id")
    private Long showtimeId;

    @Column(name = "ghe_id")
    private Long seatId;

    /** Người giữ ghế; null khi khách vãng lai mua tại quầy. */
    @Column(name = "nguoi_dung_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "trang_thai_ghe")
    private SeatStatus status;

    /** Hạn giữ ghế, chỉ dùng khi DANG_GIU. */
    @Column(name = "het_han_luc")
    private LocalDateTime expiresAt;
}
