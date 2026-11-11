package com.cgdn.cinema.modules.showtime.entity;

import java.time.LocalDateTime;
import com.cgdn.cinema.modules.room.entity.Room;
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
@Table(name = "suat_chieu")
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "phim_id")
    private Long movieId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "phong_chieu_id")
    private Room room;

    @Column(name = "bat_dau")
    private LocalDateTime startTime;

    /** Đã cộng thời gian dọn phòng. */
    @Column(name = "ket_thuc")
    private LocalDateTime endTime;

    @Column(name = "trang_thai")
    private Integer status;
}
