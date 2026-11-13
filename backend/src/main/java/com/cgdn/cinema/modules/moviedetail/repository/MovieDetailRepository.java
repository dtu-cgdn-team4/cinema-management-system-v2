package com.cgdn.cinema.modules.moviedetail.repository;

import com.cgdn.cinema.modules.moviedetail.entity.MovieDetailEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface MovieDetailRepository extends Repository<MovieDetailEntity, Long> {

    @Query("""
            select distinct movie from MovieDetailEntity movie
            left join fetch movie.genres
            where movie.id = :movieId and movie.status = 1
            """)
    Optional<MovieDetailEntity> findVisibleById(@Param("movieId") Long movieId);

    @Query(value = """
            select showtime.id as id, room.id as roomId, room.ten_phong as roomName,
                   cinema.id as cinemaId, cinema.ten_rap as cinemaName,
                   cinema.thanh_pho as cinemaCity, cinema.dia_chi as cinemaAddress,
                   showtime.bat_dau as startsAt, showtime.ket_thuc as endsAt
            from suat_chieu showtime
            join phong_chieu room on room.id = showtime.phong_chieu_id
            join rap cinema on cinema.id = room.rap_id
            where showtime.phim_id = :movieId
              and showtime.trang_thai = 1
              and room.trang_thai = 1
              and cinema.trang_thai = 1
              and showtime.bat_dau > :startsAfter
            order by showtime.bat_dau, showtime.id
            """, nativeQuery = true)
    List<MovieDetailShowtimeProjection> findUpcomingShowtimes(
            @Param("movieId") Long movieId, @Param("startsAfter") LocalDateTime startsAfter);

    @Query(value = """
            select showtime.id as id, room.id as roomId, room.ten_phong as roomName,
                   cinema.id as cinemaId, cinema.ten_rap as cinemaName,
                   cinema.thanh_pho as cinemaCity, cinema.dia_chi as cinemaAddress,
                   showtime.bat_dau as startsAt, showtime.ket_thuc as endsAt,
                   (select count(*) from ghe seat
                    where seat.phong_chieu_id = room.id and seat.trang_thai = 1) as totalSeats,
                   (select count(distinct seat_state.ghe_id)
                    from ghe_suat_chieu seat_state
                    join ghe seat on seat.id = seat_state.ghe_id
                    where seat_state.suat_chieu_id = showtime.id
                      and seat.phong_chieu_id = room.id and seat.trang_thai = 1
                      and (seat_state.trang_thai_ghe in ('DA_THANH_TOAN', 'CHO_THANH_TOAN')
                           or (seat_state.trang_thai_ghe = 'DANG_GIU'
                               and (seat_state.het_han_luc is null or seat_state.het_han_luc > :now)))
                   ) as occupiedSeats
            from suat_chieu showtime
            join phong_chieu room on room.id = showtime.phong_chieu_id
            join rap cinema on cinema.id = room.rap_id
            where showtime.phim_id = :movieId
              and showtime.trang_thai = 1 and room.trang_thai = 1 and cinema.trang_thai = 1
              and showtime.bat_dau > :now
              and showtime.bat_dau >= :dayStart and showtime.bat_dau < :dayEnd
              and cinema.id = :cinemaId
            order by room.id, showtime.bat_dau, showtime.id
            """, nativeQuery = true)
    List<MovieDetailAvailabilityProjection> findShowtimeAvailability(
            @Param("movieId") Long movieId, @Param("cinemaId") Long cinemaId,
            @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd,
            @Param("now") LocalDateTime now);

    @Query(value = """
            select distinct seat.phong_chieu_id as roomId, seat.loai_ghe as seatType, price.gia as amount
            from ghe seat
            left join bang_gia price on price.loai_ghe = seat.loai_ghe
                                   and price.thu_trong_tuan = :dayOfWeek
            where seat.phong_chieu_id in (:roomIds) and seat.trang_thai = 1
            order by seat.phong_chieu_id, seat.loai_ghe
            """, nativeQuery = true)
    List<MovieDetailPriceProjection> findRoomPrices(
            @Param("roomIds") Collection<Long> roomIds, @Param("dayOfWeek") int dayOfWeek);

    @Query(value = """
            select candidate.id from phim candidate
            where candidate.id <> :movieId and candidate.trang_thai = 1
              and candidate.ngay_ket_thuc >= :today
            order by (select count(*) from phim_the_loai candidate_genre
                      join phim_the_loai source_genre
                        on candidate_genre.the_loai_id = source_genre.the_loai_id
                      where candidate_genre.phim_id = candidate.id and source_genre.phim_id = :movieId) desc,
                     candidate.ngay_khoi_chieu desc, candidate.id
            """, nativeQuery = true)
    List<Long> findRelatedMovieIds(@Param("movieId") Long movieId, @Param("today") LocalDate today,
                                   Pageable pageable);

    @Query("""
            select distinct movie from MovieDetailEntity movie
            left join fetch movie.genres where movie.id in :movieIds and movie.status = 1
            """)
    List<MovieDetailEntity> findVisibleByIds(@Param("movieIds") Collection<Long> movieIds);
}
