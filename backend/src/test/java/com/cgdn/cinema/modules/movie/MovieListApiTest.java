package com.cgdn.cinema.modules.movie;

import com.cgdn.cinema.common.constants.AppConstants;
import com.google.firebase.auth.FirebaseAuth;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:movie_list_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1",
        "spring.jpa.open-in-view=false",
        "spring.jpa.properties.hibernate.query.fail_on_pagination_over_collection_fetch=true"
})
@ActiveProfiles("test")
@AutoConfigureMockMvc
class MovieListApiTest {
    @MockitoBean FirebaseAuth firebaseAuth;
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;

    @BeforeEach
    void prepareMovies() {
        jdbc.update("DELETE FROM phim_the_loai WHERE phim_id BETWEEN 900 AND 904");
        jdbc.update("DELETE FROM phim WHERE id BETWEEN 900 AND 904");
        jdbc.update("DELETE FROM the_loai WHERE id IN (900, 901)");
        jdbc.update("INSERT INTO the_loai (id, ten) VALUES (900, 'Action test'), (901, 'Drama test')");
        LocalDate today = LocalDate.now(AppConstants.ZONE);
        insertMovie(900, today, today, 1);
        insertMovie(901, today, today.plusDays(5), 1);
        insertMovie(902, today.plusDays(1), today.plusDays(10), 1);
        insertMovie(903, today.minusDays(3), today.minusDays(1), 1);
        insertMovie(904, today, today.plusDays(5), 2);
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
    void genresReturnIdsAndNamesForTheFilter() throws Exception {
        mvc.perform(get("/api/v1/movies/genres"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id").value(900))
                .andExpect(jsonPath("$.data[0].name").value("Action test"))
                .andExpect(jsonPath("$.data[1].id").value(901));
    }

    @Test
    void nowShowingPagesAtDatabaseAndKeepsAllGenres() throws Exception {
        mvc.perform(get("/api/v1/movies/now-showing").param("genreId", "900").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].id").value(900))
                .andExpect(jsonPath("$.data.content[0].title").value("Test movie 900"))
                .andExpect(jsonPath("$.data.content[0].genres", hasSize(2)))
                .andExpect(jsonPath("$.data.pageNo").value(0))
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2));
        mvc.perform(get("/api/v1/movies/now-showing").param("genreId", "900")
                        .param("size", "1").param("page", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].id").value(901))
                .andExpect(jsonPath("$.data.last").value(true));
    }

    @Test
    void comingSoonExcludesTodayExpiredAndDeletedMovies() throws Exception {
        mvc.perform(get("/api/v1/movies/coming-soon"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].id").value(902));
    }

    @Test
    void emptyAndOutOfRangePagesRemainSuccessful() throws Exception {
        mvc.perform(get("/api/v1/movies/now-showing").param("page", "99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)))
                .andExpect(jsonPath("$.data.totalElements").value(2));
        mvc.perform(get("/api/v1/movies/coming-soon").param("genreId", "901"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void invalidPageAndParameterTypesReturnBadRequest() throws Exception {
        mvc.perform(get("/api/v1/movies/now-showing").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
        for (String parameter : new String[]{"page", "size", "genreId"}) {
            mvc.perform(get("/api/v1/movies/coming-soon").param(parameter, "abc"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value(400));
        }
    }

    @Test
    void pageSizesAreBounded() throws Exception {
        mvc.perform(get("/api/v1/movies/now-showing").param("size", "1000"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.pageSize").value(100));
        mvc.perform(get("/api/v1/movies/coming-soon").param("size", "0"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.pageSize").value(10));
    }

    @Test
    void originalShowingEndpointKeepsDevelopContract() throws Exception {
        mvc.perform(get("/api/v1/movies").param("status", "SHOWING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].id").value(900))
                .andExpect(jsonPath("$.data[0].genres", hasSize(2)))
                .andExpect(jsonPath("$.data[0].duration").value(120));
    }
}
