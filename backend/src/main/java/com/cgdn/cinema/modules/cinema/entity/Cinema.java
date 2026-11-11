package com.cgdn.cinema.modules.cinema.entity;

import java.time.LocalTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "rap")
public class Cinema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_rap")
    private String name;

    @Column(name = "thanh_pho")
    private String city;

    @Column(name = "dia_chi")
    private String address;

    @Column(name = "so_dien_thoai")
    private String phone;

    @Column(name = "gio_mo_cua")
    private LocalTime openTime;

    @Column(name = "gio_dong_cua")
    private LocalTime closeTime;

    @Column(name = "hinh_anh_url")
    private String imageUrl;

    @Column(name = "trang_thai")
    private Integer status;
}
