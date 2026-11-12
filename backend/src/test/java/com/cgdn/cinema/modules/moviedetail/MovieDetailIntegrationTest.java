package com.cgdn.cinema.modules.moviedetail;

import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailRepository;
import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailShowtimeProjection;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:movie_detail_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false"
})
@AutoConfigureMockMvc
@Transactional
@Sql(scripts = "/moviedetail/movie-detail-fixture.sql", config = @SqlConfig(encoding = "UTF-8"))
class MovieDetailIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MovieDetailRepository repository;

    @Test
    void returnsDetailsFromExistingSchemaAndOnlyUpcomingActiveShowtimes() throws Exception {
        mockMvc.perform(get("/api/v1/movies/9001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.message").value("Thành công"))
                .andExpect(jsonPath("$.data.id").value(9001))
                .andExpect(jsonPath("$.data.title").value("Phim kiểm thử"))
                .andExpect(jsonPath("$.data.posterUrl").value("https://cinema.example/poster.jpg"))
                .andExpect(jsonPath("$.data.director").value("Đạo diễn"))
                .andExpect(jsonPath("$.data.actors", contains("Diễn viên A", "Diễn viên B")))
                .andExpect(jsonPath("$.data.genres[*].id", contains(9401, 9402)))
                .andExpect(jsonPath("$.data.genres[*].name", contains("Hành động", "Tâm lý")))
                .andExpect(jsonPath("$.data.duration").value(120))
                .andExpect(jsonPath("$.data.releaseDate").value("2000-01-01"))
                .andExpect(jsonPath("$.data.ageRating").value("T16"))
                .andExpect(jsonPath("$.data.description").value("Nội dung phim"))
                .andExpect(jsonPath("$.data.trailerUrl").value("https://www.youtube.com/watch?v=test"))
                .andExpect(jsonPath("$.data.status").value(1))
                .andExpect(jsonPath("$.data.showtimes", hasSize(2)))
                .andExpect(jsonPath("$.data.showtimes[*].id", contains(9302, 9301)))
                .andExpect(jsonPath("$.data.showtimes[0].roomId").value(9101))
                .andExpect(jsonPath("$.data.showtimes[0].roomName").value("Phòng kiểm thử"))
                .andExpect(jsonPath("$.data.showtimes[0].cinemaId").value(9201))
                .andExpect(jsonPath("$.data.showtimes[0].cinemaName").value("Rạp kiểm thử"))
                .andExpect(jsonPath("$.data.showtimes[0].startsAt").value("2099-01-01T12:00:00"))
                .andExpect(jsonPath("$.data.showtimes[0].endsAt").value("2099-01-01T14:15:00"));
    }

    @Test
    void supportsVersionedPathUsedByExistingSeedDocumentation() throws Exception {
        mockMvc.perform(get("/api/v1/movies/9001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(9001));
    }

    @ParameterizedTest
    @ValueSource(longs = {9002, 9999})
    void returns404ForDeletedOrMissingMovie(long movieId) throws Exception {
        mockMvc.perform(get("/api/v1/movies/{movieId}", movieId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy phim với ID: " + movieId))
                .andExpect(jsonPath("$.errorCode").value("MOVIE_NOT_FOUND"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void returnsUpcomingMovieDetails() throws Exception {
        mockMvc.perform(get("/api/v1/movies/9003"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(9003))
                .andExpect(jsonPath("$.data.releaseDate").value("2099-01-01"))
                .andExpect(jsonPath("$.data.status").value(1));
    }

    @Test
    void returnsMovieWithoutGenresActorsOrShowtimes() throws Exception {
        mockMvc.perform(get("/api/v1/movies/9004"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(9004))
                .andExpect(jsonPath("$.data.actors").isEmpty())
                .andExpect(jsonPath("$.data.genres").isEmpty())
                .andExpect(jsonPath("$.data.showtimes").isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"0", "-1", "abc", "1.5", "9223372036854775808"})
    void rejectsInvalidMovieIds(String movieId) throws Exception {
        mockMvc.perform(get("/api/v1/movies/{movieId}", movieId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("ID phim phải là số nguyên dương hợp lệ."))
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void excludesShowtimeStartingExactlyAtCutoff() {
        assertThat(repository.findUpcomingShowtimes(9001L, LocalDateTime.of(2099, 1, 1, 12, 0)))
                .extracting(MovieDetailShowtimeProjection::getId)
                .containsExactly(9301L);
    }
}
