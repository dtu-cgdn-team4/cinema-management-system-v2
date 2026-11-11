package com.cgdn.cinema.modules.showtime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import com.cgdn.cinema.common.constants.AppConstants;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/** SRS 6.2.1 trên dữ liệu mẫu db/seed: phim 1–4 đang chiếu, 5 sắp chiếu, 6 đã hết chiếu. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class ShowtimeSelectionApiTest {

    // Giá ghế thường SRS 6.8
    private static final Map<DayOfWeek, Long> PRICES = Map.of(
            DayOfWeek.MONDAY, 50000L, DayOfWeek.TUESDAY, 45000L, DayOfWeek.WEDNESDAY, 50000L,
            DayOfWeek.THURSDAY, 50000L, DayOfWeek.FRIDAY, 65000L, DayOfWeek.SATURDAY, 65000L,
            DayOfWeek.SUNDAY, 65000L);

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Test
    void listsOnlyMoviesShowingToday() throws Exception {
        JsonNode data = getData("/api/v1/movies?status=SHOWING");

        List<Long> ids = data.findValues("id").stream().map(JsonNode::asLong).toList();
        assertThat(ids).containsExactlyInAnyOrder(1L, 2L, 3L, 4L);
        assertThat(data.get(0).get("genres").isArray()).isTrue();
    }

    @Test
    void returnsUpcomingShowtimesSortedWithWeekdayPrice() throws Exception {
        JsonNode data = getData("/api/v1/movies/1/showtimes");

        assertThat(data.size()).isPositive();
        LocalDateTime now = LocalDateTime.now(AppConstants.ZONE);
        LocalDateTime previous = null;
        for (JsonNode s : data) {
            LocalDateTime start = LocalDateTime.parse(s.get("startTime").asText());
            LocalDateTime end = LocalDateTime.parse(s.get("endTime").asText());
            assertThat(start).isAfter(now);
            assertThat(end).isEqualTo(start.plusMinutes(166));
            assertThat(s.get("price").asLong()).isEqualTo(PRICES.get(start.getDayOfWeek()));
            assertThat(s.get("room").get("totalSeats").asInt()).isEqualTo(96);
            if (previous != null) {
                assertThat(start).isAfterOrEqualTo(previous);
            }
            previous = start;
        }
    }

    @Test
    void listsActiveCinemas() throws Exception {
        JsonNode cinemas = getData("/api/v1/cinemas");

        assertThat(cinemas.size()).isEqualTo(5);
        assertThat(cinemas.findValuesAsText("city")).contains("Đà Nẵng", "TP. Hồ Chí Minh");
    }

    @Test
    void filtersShowtimesByCinemaAndDate() throws Exception {
        JsonNode all = getData("/api/v1/movies/1/showtimes");
        long cinemaId = all.get(0).get("cinemaId").asLong();
        String date = all.get(0).get("startTime").asText().substring(0, 10);

        JsonNode filtered = getData("/api/v1/movies/1/showtimes?cinemaId=" + cinemaId + "&date=" + date);

        assertThat(filtered.size()).isPositive().isLessThan(all.size());
        for (JsonNode s : filtered) {
            assertThat(s.get("cinemaId").asLong()).isEqualTo(cinemaId);
            assertThat(s.get("cinemaName").asText()).isNotBlank();
            assertThat(s.get("startTime").asText()).startsWith(date);
        }
    }

    @Test
    void movieNotShowingReturns404() throws Exception {
        for (String id : List.of("5", "6", "999")) {
            mvc.perform(get("/api/v1/movies/" + id + "/showtimes"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.success").value(false))
                    .andExpect(jsonPath("$.errorCode").value("MOVIE_NOT_FOUND"));
        }
    }

    @Test
    void badStatusReturns400() throws Exception {
        mvc.perform(get("/api/v1/movies?status=FOO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
    }

    private JsonNode getData(String url) throws Exception {
        String body = mvc.perform(get(url)).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode root = json.readTree(body);
        assertThat(root.get("success").asBoolean()).isTrue();
        return root.get("data");
    }
}
