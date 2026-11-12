package com.cgdn.cinema.modules.movie.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.common.response.PageResponse;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.movie.dto.response.MovieAdminResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieResponse;
import com.cgdn.cinema.modules.movie.dto.response.MovieListResponse;
import com.cgdn.cinema.modules.movie.dto.response.GenreResponse;
import com.cgdn.cinema.modules.movie.repository.GenreRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import com.cgdn.cinema.modules.movie.entity.Genre;
import com.cgdn.cinema.modules.movie.entity.Movie;
import com.cgdn.cinema.modules.movie.mapper.MovieMapper;
import com.cgdn.cinema.modules.movie.repository.MovieRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;
    private final Clock clock;

    /** Phim đang chiếu: hôm nay nằm trong [ngày khởi chiếu, ngày kết thúc] (Q&A #38). */
    public List<MovieResponse> getShowingMovies() {
        return movieRepository.findShowing(LocalDate.now(clock), AppConstants.STATUS_ACTIVE).stream()
                .map(MovieMapper::toResponse)
                .toList();
    }

    /** Phim đang chiếu theo id, không có thì ném MOVIE_NOT_FOUND. */
    public Movie getShowingMovie(Long id) {
        return movieRepository.findShowingById(id, LocalDate.now(clock), AppConstants.STATUS_ACTIVE)
                .orElseThrow(() -> new BusinessException(ErrorCode.MOVIE_NOT_FOUND));
    }

    public Page<MovieListResponse> getNowShowingMovies(int page, int size, Long genreId) {
        validatePage(page);
        var pageable = PageRequest.of(page, clampSize(size),
                Sort.by(Sort.Direction.DESC, "releaseDate").and(Sort.by("id")));
        return movieRepository.findNowShowing(LocalDate.now(clock), genreId, pageable)
                .map(MovieMapper::toMovieListResponse);
    }

    public Page<MovieListResponse> getComingSoonMovies(int page, int size, Long genreId) {
        validatePage(page);
        var pageable = PageRequest.of(page, clampSize(size),
                Sort.by(Sort.Direction.ASC, "releaseDate").and(Sort.by("id")));
        return movieRepository.findComingSoon(LocalDate.now(clock), genreId, pageable)
                .map(MovieMapper::toMovieListResponse);
    }

    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAllOrderByTen().stream()
                .map(MovieMapper::toGenreResponse).toList();
    }

    private int clampSize(int size) {
        return size < 1 ? 10 : Math.min(size, 100);
    }

    private void validatePage(int page) {
        if (page < 0) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST, "Số trang phải lớn hơn hoặc bằng 0");
        }
    }

    /**
     * Lấy danh sách phim theo từ khóa, thể loại và trạng thái, có hỗ trợ phân trang.
     */
    public PageResponse<MovieAdminResponse> getMovies(
            String keyword, Long theLoaiId, String status, Pageable pageable) {
        LocalDate today = LocalDate.now(clock);

        Specification<Movie> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("title")),
                        "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (theLoaiId != null) {
                predicates.add(cb.equal(root.join("genres").get("id"), theLoaiId));
            }

            if (status != null && !status.isBlank()) {
                // Trạng thái chiếu được xác định từ trạng thái lưu và khoảng ngày chiếu của phim.
                switch (status.trim().toUpperCase(Locale.ROOT)) {
                    case "DANG_CHIEU" -> predicates.add(cb.and(
                            cb.equal(root.get("status"), AppConstants.STATUS_ACTIVE),
                            cb.lessThanOrEqualTo(root.get("releaseDate"), today),
                            cb.greaterThanOrEqualTo(root.get("endDate"), today)
                    ));
                    case "SAP_CHIEU" -> predicates.add(cb.and(
                            cb.equal(root.get("status"), AppConstants.STATUS_ACTIVE),
                            cb.greaterThan(root.get("releaseDate"), today)
                    ));
                    case "NGUNG_CHIEU" -> predicates.add(cb.or(
                            cb.equal(root.get("status"), RecordStatus.DELETED.getCode()),
                            cb.lessThan(root.get("endDate"), today)
                    ));
                    default -> {
                    }
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
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.MOVIE_NOT_FOUND, "Không tìm thấy phim với ID: " + id));
        movie.setStatus(RecordStatus.DELETED.getCode());
        movieRepository.save(movie);
    }

    /** Chuyển entity sang response Admin và xác định trạng thái hiển thị theo lịch chiếu. */
    private MovieAdminResponse mapToAdminResponse(Movie movie) {
        LocalDate today = LocalDate.now(clock);
        String trangThaiHienThi;

        if (movie.getStatus() == RecordStatus.DELETED.getCode() || today.isAfter(movie.getEndDate())) {
            trangThaiHienThi = "NGUNG_CHIEU";
        } else if (today.isBefore(movie.getReleaseDate())) {
            trangThaiHienThi = "SAP_CHIEU";
        } else {
            trangThaiHienThi = "DANG_CHIEU";
        }

        long tongSuatChieu = movieRepository.countShowtimesByMovieId(movie.getId());

        List<String> theLoaiNames = movie.getGenres() != null
                ? movie.getGenres().stream().map(Genre::getName).toList()
                : List.of();

        return MovieAdminResponse.builder()
                .id(movie.getId())
                .tenPhim(movie.getTitle())
                .posterUrl(movie.getPosterUrl())
                .theLoai(theLoaiNames)
                .thoiLuong(movie.getDuration())
                .nhanTuoi(movie.getAgeRating().name())
                .ngayKhoiChieu(movie.getReleaseDate())
                .ngayKetThuc(movie.getEndDate())
                .dinhDang("2D")
                .tongSuatChieu(tongSuatChieu)
                .trangThaiHienThi(trangThaiHienThi)
                .trangThai(movie.getStatus())
                .build();
    }
}
