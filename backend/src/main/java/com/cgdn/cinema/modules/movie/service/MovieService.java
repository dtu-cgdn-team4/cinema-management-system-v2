package com.cgdn.cinema.modules.movie.service;

import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.exception.ResourceNotFoundException;
import com.cgdn.cinema.modules.movie.dto.response.MovieAdminResponse;
import com.cgdn.cinema.modules.movie.entity.Genre;
import com.cgdn.cinema.modules.movie.entity.Movie;
import com.cgdn.cinema.modules.movie.repository.MovieRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;

    /**
     * Lấy danh sách phim theo từ khóa, thể loại và trạng thái, có hỗ trợ phân trang.
     */
    @Transactional(readOnly = true)
    public PageResponse<MovieAdminResponse> getMovies(String keyword, Long theLoaiId, String status, Pageable pageable) {
        LocalDate today = LocalDate.now();

        Specification<Movie> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("tenPhim")), "%" + keyword.trim().toLowerCase() + "%"));
            }

            if (theLoaiId != null) {
                predicates.add(cb.equal(root.join("theLoais").get("id"), theLoaiId));
            }

            if (status != null && !status.trim().isEmpty()) {
                // Trạng thái chiếu được xác định từ trạng thái lưu và khoảng ngày chiếu của phim.
                switch (status.trim().toUpperCase()) {
                    case "DANG_CHIEU" -> predicates.add(cb.and(
                            cb.equal(root.get("trangThai"), 1),
                            cb.lessThanOrEqualTo(root.get("ngayKhoiChieu"), today),
                            cb.greaterThanOrEqualTo(root.get("ngayKetThuc"), today)
                    ));
                    case "SAP_CHIEU" -> predicates.add(cb.and(
                            cb.equal(root.get("trangThai"), 1),
                            cb.greaterThan(root.get("ngayKhoiChieu"), today)
                    ));
                    case "NGUNG_CHIEU" -> predicates.add(cb.or(
                            cb.equal(root.get("trangThai"), 2),
                            cb.lessThan(root.get("ngayKetThuc"), today)
                    ));
                    default -> {}
                }
            }

            if (query != null) {
                // Một phim có thể thuộc nhiều thể loại, nên cần loại kết quả trùng.
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Movie> moviePage = movieRepository.findAll(spec, pageable);
        return PageResponse.from(moviePage.map(this::mapToAdminResponse));
    }

    /** Ngừng chiếu phim bằng cách cập nhật trạng thái, không xóa bản ghi khỏi cơ sở dữ liệu. */
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ phim với ID: " + id));
        movie.setTrangThai(2);
        movieRepository.save(movie);
    }

    /** Chuyển thông tin entity sang response và xác định trạng thái hiển thị theo lịch chiếu. */
    private MovieAdminResponse mapToAdminResponse(Movie movie) {
        LocalDate today = LocalDate.now();
        String trangThaiHienThi;

        if (movie.getTrangThai() == 2 || today.isAfter(movie.getNgayKetThuc())) {
            trangThaiHienThi = "NGUNG_CHIEU";
        } else if (today.isBefore(movie.getNgayKhoiChieu())) {
            trangThaiHienThi = "SAP_CHIEU";
        } else {
            trangThaiHienThi = "DANG_CHIEU";
        }

        long tongSuatChieu = movieRepository.countShowtimesByMovieId(movie.getId());

        List<String> theLoaiNames = movie.getTheLoais() != null
                ? movie.getTheLoais().stream().map(Genre::getTen).toList()
                : List.of();

        return MovieAdminResponse.builder()
                .id(movie.getId())
                .tenPhim(movie.getTenPhim())
                .posterUrl(movie.getPosterUrl())
                .theLoai(theLoaiNames)
                .thoiLuong(movie.getThoiLuong())
                .nhanTuoi(movie.getNhanTuoi())
                .ngayKhoiChieu(movie.getNgayKhoiChieu())
                .ngayKetThuc(movie.getNgayKetThuc())
                .dinhDang("2D")
                .tongSuatChieu(tongSuatChieu)
                .trangThaiHienThi(trangThaiHienThi)
                .trangThai(movie.getTrangThai())
                .build();
    }
}

