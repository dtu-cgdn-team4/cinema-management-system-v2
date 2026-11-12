package com.cgdn.cinema.modules.movie.repository;

import com.cgdn.cinema.modules.movie.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository cho bảng <code>the_loai</code>.
 */
@Repository
public interface GenreRepository extends JpaRepository<Genre, Long> {

    /**
     * Lấy toàn bộ thể loại, sắp xếp theo tên.
     */
    @Query("SELECT g FROM Genre g ORDER BY g.ten")
    List<Genre> findAllOrderByTen();
}
