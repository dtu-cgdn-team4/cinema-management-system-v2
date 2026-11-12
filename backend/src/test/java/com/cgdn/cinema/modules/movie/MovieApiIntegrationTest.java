package com.cgdn.cinema.modules.movie;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.ZoneId;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Chạy API qua controller, service, repository và schema Flyway thật trên H2. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:movie_api;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.locations=classpath:db/migration",
        "spring.jpa.show-sql=false"
})
@AutoConfigureMockMvc
class MovieApiIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void prepareMovies() {
        jdbc.update("DELETE FROM phim_the_loai WHERE phim_id BETWEEN 900 AND 904");
        jdbc.update("DELETE FROM phim WHERE id BETWEEN 900 AND 904");
        jdbc.update("DELETE FROM the_loai WHERE id IN (900, 901)");
        jdbc.update("INSERT INTO the_loai (id, ten) VALUES (900, 'Test genre'), (901, 'Other genre')");
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        insertMovie(900, today, today, 1); // Hai biên ngày đều thuộc đang chiếu.
        insertMovie(901, today, today.plusDays(2), 1);
        insertMovie(902, today.plusDays(1), today.plusDays(10), 1);
        insertMovie(903, today.minusDays(3), today.minusDays(1), 1);
        insertMovie(904, today, today.plusDays(2), 2);
        jdbc.update("INSERT INTO phim_the_loai (phim_id, the_loai_id) VALUES (900, 901)");
    }

    private void insertMovie(long id, LocalDate start, LocalDate end, int status) {
        jdbc.update("""
                INSERT INTO phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu,
                    ngay_ket_thuc, dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url,
                    noi_dung, trang_thai)
                VALUES (?, ?, 120, 'T16', ?, ?, 'Director', 'Cast', 'Studio',
                    'https://example.com/trailer', 'https://example.com/poster', 'Synopsis', ?)
                """, id, "Test movie " + id, start, end, status);
        jdbc.update("INSERT INTO phim_the_loai (phim_id, the_loai_id) VALUES (?, 900)", id);
    }

    @Test
    void nowShowingHasStablePagesAndFullGenres() throws Exception {
        mvc.perform(get("/api/movies/now-showing").param("genreId", "900").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.success").doesNotExist())
                .andExpect(jsonPath("$.errorCode").doesNotExist())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].id").value(900))
                .andExpect(jsonPath("$.data.content[0].theLoai", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].noiDung").doesNotExist())
                .andExpect(jsonPath("$.data.page").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2));
        mvc.perform(get("/api/movies/now-showing").param("genreId", "900")
                        .param("size", "1").param("page", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(901))
                .andExpect(jsonPath("$.data.last").value(true));
    }

    @Test
    void comingSoonExcludesTodayExpiredAndDeletedMovies() throws Exception {
        mvc.perform(get("/api/movies/coming-soon").param("genreId", "900"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].id").value(902));
    }

    @Test
    void pageBeyondLastReturnsEmptyList() throws Exception {
        mvc.perform(get("/api/movies/now-showing").param("genreId", "900").param("page", "99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    void invalidPageReturnsBadRequest() throws Exception {
        mvc.perform(get("/api/movies/now-showing").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.success").doesNotExist())
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void invalidParameterTypesReturnBadRequest() throws Exception {
        for (String parameter : new String[]{"page", "size", "genreId"}) {
            mvc.perform(get("/api/movies/now-showing").param(parameter, "abc"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(400))
                    .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
        }
    }

    @Test
    void pageSizeIsBounded() throws Exception {
        mvc.perform(get("/api/movies/now-showing").param("size", "1000"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.size").value(100));
        mvc.perform(get("/api/movies/coming-soon").param("size", "0"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.size").value(10));
    }

    @Test
    void deletedMovieDetailReturnsNotFound() throws Exception {
        mvc.perform(get("/api/movies/904"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.errorCode").value("MOVIE_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Không tìm thấy phim"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void detailAndGenresUseTheSameResponseFormat() throws Exception {
        mvc.perform(get("/api/movies/900"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.errorCode").doesNotExist())
                .andExpect(jsonPath("$.data.id").value(900));
        mvc.perform(get("/api/movies/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.errorCode").doesNotExist())
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    void openApiDoesNotAdvertiseKeyword() throws Exception {
        mvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paths['/api/movies/now-showing'].get.parameters", hasSize(3)))
                .andExpect(jsonPath("$.paths['/api/movies/coming-soon'].get.parameters", hasSize(3)));
    }

    @Test
    void unknownEndpointReturnsNotFoundInsteadOfServerError() throws Exception {
        mvc.perform(get("/api/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.errorCode").value("RESOURCE_NOT_FOUND"));
    }
}
