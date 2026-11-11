package com.cgdn.cinema.modules.user.repository;

import com.cgdn.cinema.modules.user.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NguoiDungRepository extends JpaRepository<NguoiDung, Long> {
    boolean existsByTaiKhoan(String taiKhoan);
    boolean existsByEmail(String email);
    boolean existsBySoDienThoai(String soDienThoai);
}
