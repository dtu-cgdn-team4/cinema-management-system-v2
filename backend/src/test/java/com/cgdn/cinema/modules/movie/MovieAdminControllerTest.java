package com.cgdn.cinema.modules.movie;

import com.cgdn.cinema.modules.movie.entity.Genre;
import com.cgdn.cinema.modules.movie.entity.Movie;
import com.cgdn.cinema.modules.movie.repository.MovieRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Set;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MovieRepository movieRepository;

    private Movie testMovie;

    @BeforeEach
    void setUp() {
        // Tạo dữ liệu phim riêng cho từng ca kiểm thử, tránh phụ thuộc dữ liệu của lần chạy trước.
        movieRepository.deleteAll();

        testMovie = Movie.builder()
                .tenPhim("Dune: Hành Tinh Cát — Phần 2")
                .thoiLuong(166)
                .nhanTuoi("T16")
                .ngayKhoiChieu(LocalDate.now().minusDays(5))
                .ngayKetThuc(LocalDate.now().plusDays(30))
                .daoDien("Denis Villeneuve")
                .dienVien("Timothée Chalamet, Zendaya")
                .hangSanXuat("Warner Bros")
                .trailerUrl("https://youtube.com/trailer")
                .posterUrl("https://image.com/poster.jpg")
                .noiDung("Nội dung phim viễn tưởng...")
                .trangThai(1)
                .build();

        testMovie = movieRepository.save(testMovie);
    }

    @Test
    @DisplayName("GET /api/admin/movies - Lấy danh sách phim thành công")
    void testGetMovies() throws Exception {
        mockMvc.perform(get("/api/admin/movies")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].tenPhim").value("Dune: Hành Tinh Cát — Phần 2"))
                .andExpect(jsonPath("$.data.content[0].dinhDang").value("2D"))
                .andExpect(jsonPath("$.data.content[0].trangThaiHienThi").value("DANG_CHIEU"));
    }

    @Test
    @DisplayName("GET /api/admin/movies?keyword=Dune - Tìm kiếm theo từ khóa")
    void testSearchMovieByKeyword() throws Exception {
        mockMvc.perform(get("/api/admin/movies")
                        .param("keyword", "Dune")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)));

        mockMvc.perform(get("/api/admin/movies")
                        .param("keyword", "Không tồn tại")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    @Test
    @DisplayName("DELETE /api/admin/movies/{id} - Xóa mềm phim thành công (trang_thai = 2)")
    void testDeleteMovie() throws Exception {
        mockMvc.perform(delete("/api/admin/movies/" + testMovie.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Ngừng chiếu bộ phim thành công"));

        Movie updated = movieRepository.findById(testMovie.getId()).orElseThrow();
        assertEquals(2, updated.getTrangThai(), "Trạng thái sau xóa mềm phải là 2 (Ngừng chiếu)");
    }

    @Test
    @DisplayName("DELETE /api/admin/movies/{id} - Lỗi 404 khi không tìm thấy phim")
    void testDeleteMovieNotFound() throws Exception {
        mockMvc.perform(delete("/api/admin/movies/999999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}

