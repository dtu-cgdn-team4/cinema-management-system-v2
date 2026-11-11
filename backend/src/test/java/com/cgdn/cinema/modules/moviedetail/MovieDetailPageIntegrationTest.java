package com.cgdn.cinema.modules.moviedetail;

import com.cgdn.cinema.modules.moviedetail.repository.MovieDetailRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
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
@Sql(scripts = {"/moviedetail/movie-detail-fixture.sql", "/moviedetail/movie-page-fixture.sql"},
        config = @SqlConfig(encoding = "UTF-8"))
class MovieDetailPageIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private MovieDetailRepository repository;

    @Test
    void returnsHeroOverviewAndTrailerDataWithoutInventingMissingMedia() throws Exception {
        mockMvc.perform(get("/api/movies/9001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.screeningStatus").value("NOW_SHOWING"))
                .andExpect(jsonPath("$.data.status").value(1))
                .andExpect(jsonPath("$.data.format").value("2D"))
                .andExpect(jsonPath("$.data.endDate").value("2100-01-01"))
                .andExpect(jsonPath("$.data.productionCompany").value("Hãng kiểm thử"))
                .andExpect(jsonPath("$.data.originalTitle").value(nullValue()))
                .andExpect(jsonPath("$.data.backdropUrl").value(nullValue()))
                .andExpect(jsonPath("$.data.subtitle").value(nullValue()))
                .andExpect(jsonPath("$.data.galleryImages").isEmpty())
                .andExpect(jsonPath("$.data.showtimes[0].cinemaCity").value("Đà Nẵng"))
                .andExpect(jsonPath("$.data.showtimes[0].movieEndsAt").value("2099-01-01T02:00:00"));
    }

    @Test
    void groupsScheduleByRoomAndReturnsActualPricesAndSeatAvailability() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-01")
                        .param("city", "Đà Nẵng"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.movieId").value(9001))
                .andExpect(jsonPath("$.data.date").value("2099-01-01"))
                .andExpect(jsonPath("$.data.city").value("Đà Nẵng"))
                .andExpect(jsonPath("$.data.cinemaId").value(9201))
                .andExpect(jsonPath("$.data.currency").value("VND"))
                .andExpect(jsonPath("$.data.availableDates", contains("2099-01-01", "2099-01-02")))
                .andExpect(jsonPath("$.data.cities", containsInAnyOrder("Đà Nẵng", "TP. Hồ Chí Minh")))
                .andExpect(jsonPath("$.data.cinemas[*].id", contains(9201, 9204)))
                .andExpect(jsonPath("$.data.cinemas[0].address").value("Địa chỉ kiểm thử"))
                .andExpect(jsonPath("$.data.rooms[*].id", contains(9101, 9104)))
                .andExpect(jsonPath("$.data.rooms[0].format").value("2D"))
                .andExpect(jsonPath("$.data.rooms[0].prices[*].seatType", contains("THUONG", "VIP")))
                .andExpect(jsonPath("$.data.rooms[0].prices[0].amount").value(50000))
                .andExpect(jsonPath("$.data.rooms[0].prices[1].amount").value(70004))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[*].id", contains(9316, 9302, 9301, 9315)))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[1].totalSeats").value(8))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[1].availableSeats").value(4))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[1].soldOut").value(false))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[1].movieEndsAt").value("2099-01-01T14:00:00"))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[1].endsAt").value("2099-01-01T14:15:00"));
    }

    @Test
    void returnsSoldOutAndNullPriceInsteadOfInventingPriceForUnconfiguredSeatType() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-01")
                        .param("cinemaId", "9201"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rooms[1].prices[0].seatType").value("LOAI_MOI"))
                .andExpect(jsonPath("$.data.rooms[1].prices[0].amount").value(nullValue()))
                .andExpect(jsonPath("$.data.rooms[1].showtimes[0].totalSeats").value(1))
                .andExpect(jsonPath("$.data.rooms[1].showtimes[0].availableSeats").value(0))
                .andExpect(jsonPath("$.data.rooms[1].showtimes[0].soldOut").value(true));
    }

    @Test
    void usesSelectedDateForIsoWeekdayPricingAndIncludesNextMidnightOnlyInNextDay() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-02")
                        .param("cinemaId", "9201"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.rooms", hasSize(1)))
                .andExpect(jsonPath("$.data.rooms[0].prices[0].amount").value(65000))
                .andExpect(jsonPath("$.data.rooms[0].prices[1].amount").value(70005))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[*].id", contains(9314, 9313)));
    }

    @Test
    void filtersByCityWithoutMakingUpRoomCapacityFromRoomGrid() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-01")
                        .param("city", "  TP. Hồ Chí Minh  "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.city").value("TP. Hồ Chí Minh"))
                .andExpect(jsonPath("$.data.cinemaId").value(9203))
                .andExpect(jsonPath("$.data.cinemas[*].id", contains(9203)))
                .andExpect(jsonPath("$.data.rooms[*].id", contains(9105)))
                .andExpect(jsonPath("$.data.rooms[0].prices").isEmpty())
                .andExpect(jsonPath("$.data.rooms[0].showtimes[0].totalSeats").value(0))
                .andExpect(jsonPath("$.data.rooms[0].showtimes[0].availableSeats").value(0));
    }

    @Test
    void keepsCinemaOptionsWhenSelectingAnotherCinema() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-01")
                        .param("city", "Đà Nẵng").param("cinemaId", "9204"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cinemaId").value(9204))
                .andExpect(jsonPath("$.data.cinemas[*].id", contains(9201, 9204)))
                .andExpect(jsonPath("$.data.rooms[*].id", contains(9106)));
    }

    @Test
    void returnsEmptyRoomsWhenCinemaDoesNotBelongToSelectedCity() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-01")
                        .param("city", "TP. Hồ Chí Minh").param("cinemaId", "9201"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cinemas[*].id", contains(9203)))
                .andExpect(jsonPath("$.data.rooms").isEmpty());
    }

    @Test
    void returnsEmptyScheduleForUnknownCity() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", "2099-01-01")
                        .param("city", "Không có khu vực này"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.cinemaId").value(nullValue()))
                .andExpect(jsonPath("$.data.availableDates").isEmpty())
                .andExpect(jsonPath("$.data.cinemas").isEmpty())
                .andExpect(jsonPath("$.data.rooms").isEmpty());
    }

    @Test
    void defaultsToTodayInCinemaTimeZoneAndReturnsEmptyListsForMovieWithoutSchedule() throws Exception {
        mockMvc.perform(get("/api/movies/9004/showtimes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.date").value(LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).toString()))
                .andExpect(jsonPath("$.data.availableDates").isEmpty())
                .andExpect(jsonPath("$.data.cities").isEmpty())
                .andExpect(jsonPath("$.data.cinemas").isEmpty())
                .andExpect(jsonPath("$.data.rooms").isEmpty());
    }

    @Test
    void ignoresHoldExpiringExactlyAtQueryTimeButKeepsHoldWithUnknownExpiryOccupied() {
        LocalDateTime now = LocalDateTime.of(2050, 1, 1, 0, 0);
        jdbcTemplate.update("UPDATE ghe_suat_chieu SET het_han_luc = ? WHERE id = 9602", Timestamp.valueOf(now));

        assertThat(repository.findShowtimeAvailability(9001L, 9201L,
                LocalDateTime.of(2099, 1, 1, 0, 0), LocalDateTime.of(2099, 1, 2, 0, 0), now))
                .filteredOn(showtime -> showtime.getId().equals(9302L))
                .singleElement().satisfies(showtime -> {
                    assertThat(showtime.getTotalSeats()).isEqualTo(8);
                    assertThat(showtime.getOccupiedSeats()).isEqualTo(3);
                });
    }

    @Test
    void returnsRelatedCardsRankedBySharedGenresAndExcludesCurrentDeletedAndEndedMovies() throws Exception {
        mockMvc.perform(get("/api/movies/9001/related"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", contains(9006, 9003, 9007, 9004)))
                .andExpect(jsonPath("$.data[0].posterUrl").value("https://cinema.example/related.jpg"))
                .andExpect(jsonPath("$.data[0].genres[*].id", contains(9401, 9402)))
                .andExpect(jsonPath("$.data[0].screeningStatus").value("NOW_SHOWING"))
                .andExpect(jsonPath("$.data[1].screeningStatus").value("UPCOMING"))
                .andExpect(jsonPath("$.data[0].format").value("2D"));
    }

    @Test
    void appliesRelatedLimit() throws Exception {
        mockMvc.perform(get("/api/movies/9001/related").param("limit", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", contains(9006)));
    }

    @Test
    void fallsBackToOtherActiveMoviesWhenSourceHasNoGenres() throws Exception {
        mockMvc.perform(get("/api/movies/9004/related"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", contains(9003, 9007, 9006, 9001)));
    }

    @Test
    void returnsEmptyRelatedListWhenNoEligibleMoviesExist() throws Exception {
        jdbcTemplate.update("UPDATE phim SET trang_thai = 2 WHERE id <> 9001");

        mockMvc.perform(get("/api/movies/9001/related"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"9002/showtimes", "9999/showtimes", "9002/related", "9999/related"})
    void rejectsMissingOrDeletedMovieOnNewEndpoints(String suffix) throws Exception {
        mockMvc.perform(get("/api/movies/" + suffix))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404));
    }

    @ParameterizedTest
    @ValueSource(strings = {"showtimes?date=bad", "showtimes?date=2099-02-30",
            "showtimes?cinemaId=0", "showtimes?cinemaId=abc", "related?limit=0",
            "related?limit=21", "related?limit=abc"})
    void validatesScheduleAndRecommendationParameters(String suffix) throws Exception {
        mockMvc.perform(get("/api/movies/9001/" + suffix))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Tham số yêu cầu không hợp lệ."));
    }

    @ParameterizedTest
    @ValueSource(strings = {"0001-01-01", "+10000-01-01"})
    void rejectsDatesOutsideMySqlDateRange(String date) throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("date", date))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Tham số yêu cầu không hợp lệ."));
    }

    @Test
    void rejectsCityLongerThanSchemaLimit() throws Exception {
        mockMvc.perform(get("/api/movies/9001/showtimes").param("city", "x".repeat(101)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void supportsBothNewEndpointsUnderVersionedAlias() throws Exception {
        mockMvc.perform(get("/api/v1/movies/9001/showtimes").param("date", "2099-01-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.movieId").value(9001));
        mockMvc.perform(get("/api/v1/movies/9001/related").param("limit", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].id", contains(9006)));
    }
}
