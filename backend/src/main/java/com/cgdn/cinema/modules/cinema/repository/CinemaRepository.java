package com.cgdn.cinema.modules.cinema.repository;

import java.util.List;
import com.cgdn.cinema.modules.cinema.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CinemaRepository extends JpaRepository<Cinema, Long> {

    List<Cinema> findByStatusOrderByCityAscIdAsc(int status);
}
