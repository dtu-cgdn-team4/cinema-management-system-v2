package com.cgdn.cinema.modules.booking;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.function.Predicate;
import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.modules.booking.dto.response.SeatStatusMessage;
import com.cgdn.cinema.modules.booking.scheduler.SeatHoldReleaseJob;
import com.cgdn.cinema.modules.booking.service.SeatStatusPublisher;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledForJreRange;
import org.junit.jupiter.api.condition.JRE;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.StompFrameHandler;
import org.springframework.messaging.simp.stomp.StompHeaders;
import org.springframework.messaging.simp.stomp.StompSession;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

/**
 * SRS 6.2.2 chọn ghế trên dữ liệu db/test-seed: phòng 8 hàng × 12 ghế, lối đi sau ghế 03 và 09,
 * mọi suất đã bán A01, A02, D05, D07, F08, F09. Giữ ghế đi qua RabbitMQ (broker nhúng), trạng thái ghế qua WebSocket.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles({"testdata", "mq"})
@EnabledForJreRange(max = JRE.JAVA_22,
        disabledReason = "Broker nhúng Qpid chưa chạy trên JDK 23+; CI chạy Java 17 nên vẫn kiểm tra")
class SeatSelectionApiTest {

    private static final String TAKEN_MESSAGE = "Ghế bạn chọn đã có người giữ hoặc đã bán, vui lòng chọn ghế khác";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private TestRestTemplate rest;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private SeatHoldReleaseJob releaseJob;

    @Autowired
    private SeatStatusPublisher publisher;

    @LocalServerPort
    private int port;

    private long showtimeId;
    private final Map<String, Long> seatIds = new HashMap<>();
    private final List<StompSession> sessions = new ArrayList<>();

    @BeforeEach
    void pickShowtime() throws Exception {
        // Suất xa nhất của phim 1, để không bị bắt đầu giữa lúc chạy test
        JsonNode showtimes = data(mvc.perform(get("/api/v1/movies/1/showtimes")));
        showtimeId = showtimes.get(showtimes.size() - 1).get("id").asLong();
        data(mvc.perform(get(seatsUrl()))).get("rows").forEach(row -> row.get("seats")
                .forEach(seat -> seatIds.put(seat.get("label").asText(), seat.get("id").asLong())));
    }

    @AfterEach
    void cleanUp() {
        sessions.forEach(StompSession::disconnect);
        jdbc.update("delete from ghe_suat_chieu where trang_thai_ghe = 'DANG_GIU'");
    }

    @Test
    void seatMapShowsLayoutPricesAndSoldSeats() throws Exception {
        JsonNode map = data(mvc.perform(get(seatsUrl())));

        assertThat(map.get("maxSeats").asInt()).isEqualTo(AppConstants.MAX_SEATS_PER_BOOKING);
        assertThat(map.get("rows")).hasSize(8);
        assertThat(map.get("rows").get(0).get("seats")).hasSize(12);
        assertThat(labels(map, "TAKEN")).containsExactlyInAnyOrder("A01", "A02", "D05", "D07", "F08", "F09");
        assertThat(map.get("prices").get("THUONG").asLong()).isPositive();
        assertThat(map.get("showtime").get("availableSeats").asInt()).isEqualTo(96 - 6);
    }

    @Test
    void holdsSeatsForTenMinutes() throws Exception {
        LocalDateTime before = LocalDateTime.now(AppConstants.ZONE);
        JsonNode hold = data(hold(1, 2, "C04", "C05"));

        assertThat(hold.get("seats").findValuesAsText("label")).containsExactly("C04", "C05");
        assertThat(LocalDateTime.parse(hold.get("expiresAt").asText())).isBetween(
                before.plusMinutes(AppConstants.SEAT_HOLD_MINUTES).minusSeconds(1),
                LocalDateTime.now(AppConstants.ZONE).plusMinutes(AppConstants.SEAT_HOLD_MINUTES));
        JsonNode map = data(mvc.perform(get(seatsUrl())));
        assertThat(hold.get("totalPrice").asLong()).isEqualTo(2 * map.get("prices").get("THUONG").asLong());
        assertThat(labels(map, "TAKEN")).contains("C04", "C05");
        assertThat(map.get("showtime").get("availableSeats").asInt()).isEqualTo(96 - 8);
    }

    @Test
    void seatCountMustMatchQuantity() throws Exception {
        expectError(hold(1, 3, "C04", "C05"), 400, "Bạn chọn thiếu 1 ghế");
        expectError(hold(1, 1, "C04", "C05"), 400, "Bạn chỉ chọn 1 ghế");
        expectError(hold(1, 0), 400, "Số lượng ghế phải từ 1 đến 8");
        expectError(hold(1, 9, "B01", "B02", "B03", "B04", "B05", "B06", "B07", "B08", "B09"), 400,
                "Số lượng ghế phải từ 1 đến 8");
    }

    @Test
    void soldOrHeldSeatCannotBeChosen() throws Exception {
        expectError(hold(1, 1, "A01"), 409, TAKEN_MESSAGE);

        data(hold(2, 2, "C04", "C05"));
        expectError(hold(1, 2, "C04", "C05"), 409, TAKEN_MESSAGE);
    }

    @Test
    void singleSeatGapRule() throws Exception {
        // Dãy D04–D09: D05, D07 đã bán nên D06 là ghế lẻ có sẵn
        expectError(hold(1, 1, "D08"), 400, "Không được để lại một ghế trống lẻ cạnh ghế bạn chọn");
        data(hold(1, 1, "D06"));
        data(hold(2, 2, "D08", "D09"));
    }

    @Test
    void choosingAgainReplacesOwnHold() throws Exception {
        data(hold(1, 3, "G01", "G02", "G03"));
        data(hold(1, 3, "H01", "H02", "H03"));

        assertThat(labels(data(mvc.perform(get(seatsUrl()))), "TAKEN"))
                .contains("H01", "H02", "H03")
                .doesNotContain("G01", "G02", "G03");
    }

    @Test
    void holdingRequiresAnExistingUser() throws Exception {
        expectError(mvc.perform(post(holdUrl()).contentType(MediaType.APPLICATION_JSON).content(body(1, "C04"))),
                401, "Vui lòng đăng nhập để đặt vé");
        expectError(hold(999, 1, "C04"), 401, "Vui lòng đăng nhập để đặt vé");
    }

    @Test
    void seatOutsideTheRoomIsRejected() throws Exception {
        expectError(holdIds(1, 1, List.of(999_999L)), 400, "Ghế không thuộc phòng chiếu của suất này");
    }

    @Test
    void onlyOneOfTwoSimultaneousRequestsForTheSameSeatsWins() throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            List<Callable<Integer>> requests = List.of(
                    () -> postHold(1, "E01", "E02", "E03"),
                    () -> postHold(2, "E01", "E02", "E03"));
            List<Integer> statuses = new ArrayList<>();
            for (Future<Integer> result : pool.invokeAll(requests)) {
                statuses.add(result.get());
            }
            assertThat(statuses).containsExactlyInAnyOrder(200, 409);
        } finally {
            pool.shutdown();
        }
    }

    @Test
    void heldSeatsArePushedOverWebSocket() throws Exception {
        BlockingQueue<SeatStatusMessage> messages = subscribe();
        List<Long> held = List.of(seatIds.get("B01"), seatIds.get("B02"), seatIds.get("B03"));

        data(hold(1, 3, "B01", "B02", "B03"));

        assertThat(awaitMessage(messages, m -> m.takenSeatIds().containsAll(held))).isNotNull();
    }

    @Test
    void clientsCannotPublishSeatStatus() throws Exception {
        BlockingQueue<SeatStatusMessage> messages = subscribe();
        StompSession client = sessions.get(sessions.size() - 1);

        client.send(SeatStatusPublisher.TOPIC.formatted(showtimeId), new SeatStatusMessage(showtimeId, List.of(-1L)));

        assertThat(awaitMessage(messages, m -> m.takenSeatIds().contains(-1L))).as("tin giả từ client").isNull();
    }

    @Test
    void expiredHoldsAreReleasedAndViewersNotified() throws Exception {
        data(hold(1, 3, "B01", "B02", "B03"));
        BlockingQueue<SeatStatusMessage> messages = subscribe();
        jdbc.update("update ghe_suat_chieu set het_han_luc = ? where trang_thai_ghe = 'DANG_GIU'",
                LocalDateTime.now(AppConstants.ZONE).minusMinutes(1));
        assertThat(labels(data(mvc.perform(get(seatsUrl()))), "TAKEN")).as("quá hạn coi là trống ngay")
                .doesNotContain("B01", "B02", "B03");

        releaseJob.releaseExpiredHolds();

        assertThat(awaitMessage(messages, m -> !m.takenSeatIds().contains(seatIds.get("B01")))).isNotNull();
        assertThat(jdbc.queryForObject("select count(*) from ghe_suat_chieu where trang_thai_ghe = 'DANG_GIU'",
                Integer.class)).isZero();
    }

    private String seatsUrl() {
        return "/api/v1/showtimes/" + showtimeId + "/seats";
    }

    private String holdUrl() {
        return seatsUrl() + "/hold";
    }

    private String body(int quantity, String... labels) throws Exception {
        return bodyIds(quantity, Arrays.stream(labels).map(seatIds::get).toList());
    }

    private String bodyIds(int quantity, List<Long> ids) throws Exception {
        return json.writeValueAsString(Map.of("quantity", quantity, "seatIds", ids));
    }

    private ResultActions hold(long userId, int quantity, String... labels) throws Exception {
        return holdIds(userId, quantity, Arrays.stream(labels).map(seatIds::get).toList());
    }

    private ResultActions holdIds(long userId, int quantity, List<Long> ids) throws Exception {
        return mvc.perform(post(holdUrl()).header("X-User-Id", userId)
                .contentType(MediaType.APPLICATION_JSON).content(bodyIds(quantity, ids)));
    }

    /** Gửi qua HTTP thật để hai request chạy song song. */
    private int postHold(long userId, String... labels) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", String.valueOf(userId));
        return rest.postForEntity(holdUrl(), new HttpEntity<>(body(labels.length, labels), headers), String.class)
                .getStatusCode().value();
    }

    private JsonNode data(ResultActions result) throws Exception {
        String body = result.andExpect(status().isOk()).andReturn().getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
        JsonNode root = json.readTree(body);
        assertThat(root.get("code").asInt()).isEqualTo(200);
        return root.get("data");
    }

    private void expectError(ResultActions result, int httpStatus, String message) throws Exception {
        String body = result.andExpect(status().is(httpStatus)).andReturn().getResponse()
                .getContentAsString(StandardCharsets.UTF_8);
        JsonNode root = json.readTree(body);
        assertThat(root.get("code").asInt()).isEqualTo(httpStatus);
        assertThat(root.get("message").asText()).isEqualTo(message);
    }

    private static List<String> labels(JsonNode seatMap, String status) {
        List<String> labels = new ArrayList<>();
        seatMap.get("rows").forEach(row -> row.get("seats").forEach(seat -> {
            if (seat.get("status").asText().equals(status)) {
                labels.add(seat.get("label").asText());
            }
        }));
        return labels;
    }

    private BlockingQueue<SeatStatusMessage> subscribe() throws Exception {
        WebSocketStompClient client = new WebSocketStompClient(new StandardWebSocketClient());
        client.setMessageConverter(new MappingJackson2MessageConverter());
        StompSession session = client.connectAsync("ws://localhost:" + port + "/ws", new StompSessionHandlerAdapter() {
        }).get(5, TimeUnit.SECONDS);
        sessions.add(session);
        BlockingQueue<SeatStatusMessage> messages = new LinkedBlockingQueue<>();
        session.subscribe(SeatStatusPublisher.TOPIC.formatted(showtimeId), new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return SeatStatusMessage.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                messages.add((SeatStatusMessage) payload);
            }
        });
        // SUBSCRIBE xử lý bất đồng bộ: đẩy thử tới khi nhận được tin thì chắc đã đăng ký xong
        SeatStatusMessage warmUp = null;
        for (int i = 0; i < 50 && warmUp == null; i++) {
            publisher.publish(showtimeId);
            warmUp = messages.poll(100, TimeUnit.MILLISECONDS);
        }
        assertThat(warmUp).as("đăng ký kênh WebSocket").isNotNull();
        return messages;
    }

    /** Tin đầu tiên khớp điều kiện trong 5 giây, bỏ qua tin cũ còn sót từ lúc đăng ký. */
    private static SeatStatusMessage awaitMessage(BlockingQueue<SeatStatusMessage> messages,
                                                  Predicate<SeatStatusMessage> condition) throws InterruptedException {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        while (System.nanoTime() < deadline) {
            SeatStatusMessage message = messages.poll(100, TimeUnit.MILLISECONDS);
            if (message != null && condition.test(message)) {
                return message;
            }
        }
        return null;
    }
}
