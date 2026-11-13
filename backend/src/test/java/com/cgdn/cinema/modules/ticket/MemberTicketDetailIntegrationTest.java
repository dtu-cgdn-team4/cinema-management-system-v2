package com.cgdn.cinema.modules.ticket;

import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.security.JwtProperties;
import com.cgdn.cinema.security.JwtTokenProvider;
import com.google.firebase.auth.FirebaseAuth;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Dùng SecurityFilterChain/JWT và Repository thật; chỉ ghi fixture vào H2 riêng rồi rollback. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:member_ticket_detail_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.jpa.open-in-view=false",
        "spring.jpa.show-sql=false",
        "logging.level.root=WARN",
        "debug=false"
})
@AutoConfigureMockMvc
@Import(MemberTicketDetailIntegrationTest.FixedClockConfiguration.class)
@Transactional
class MemberTicketDetailIntegrationTest {

    private static final String DETAIL_PATH = "/api/me/bookings/{bookingCode}";
    private static final LocalDateTime STARTS_AT = LocalDateTime.of(2026, 11, 4, 14, 30);
    private static final LocalDateTime BOOKED_AT = LocalDateTime.of(2026, 11, 1, 10, 0);

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {

        @Bean
        @Primary
        Clock memberTicketDetailTestClock() {
            return Clock.fixed(Instant.parse("2026-11-04T07:30:00Z"), ZoneOffset.UTC);
        }
    }

    @MockitoBean
    private FirebaseAuth firebaseAuth;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private UserRepository users;

    @Autowired
    private JwtTokenProvider tokens;

    @Autowired
    private JwtProperties jwtProperties;

    private String memberToken;

    @BeforeEach
    void createFixture() {
        jdbc.update("""
                insert into rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai,
                                 gio_mo_cua, gio_dong_cua, hinh_anh_url)
                values (1001, 'Detail Cinema', 'Da Nang', '123 Detail Street', '0236000000',
                        '08:00:00', '23:30:00', 'https://example.test/cinema.jpg')
                """);
        jdbc.update("""
                insert into nguoi_dung (id, tai_khoan, ho_ten, email, vai_tro, rap_id) values
                (101, 'detail_owner', 'Detail Owner', 'detail-owner@example.test', 'KHACH_HANG', null),
                (102, 'detail_other', 'Detail Other', 'detail-other@example.test', 'KHACH_HANG', null),
                (103, 'detail_recipient', 'Gift Recipient', 'gift@example.test', 'KHACH_HANG', null),
                (104, 'detail_admin', 'Detail Admin', 'detail-admin@example.test', 'ADMIN', null),
                (105, 'detail_staff', 'Detail Staff', 'detail-staff@example.test', 'NHAN_VIEN', 1001)
                """);
        jdbc.update("""
                insert into phong_chieu (id, rap_id, ten_phong, so_hang, so_cot)
                values (2001, 1001, 'Room 01', 6, 10)
                """);
        jdbc.update("""
                insert into phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc,
                                  dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung)
                values (3001, 'Detail Movie', 166, 'T18', '2020-01-01', '2099-12-31',
                        'Director', 'Actor', 'Studio', 'https://example.test/trailer',
                        'https://example.test/poster.jpg', 'Detail test movie')
                """);
        jdbc.update("""
                insert into suat_chieu (id, phim_id, phong_chieu_id, bat_dau, ket_thuc) values
                (4001, 3001, 2001, ?, ?), (4002, 3001, 2001, ?, ?)
                """, STARTS_AT, STARTS_AT.plusMinutes(181),
                STARTS_AT.withHour(23), STARTS_AT.withHour(23).plusMinutes(181));
        jdbc.update("""
                insert into ghe (id, phong_chieu_id, ten_hang, so_ghe, vi_tri_cot, loai_ghe) values
                (5001, 2001, 'F', 6, 6, 'VIP'), (5002, 2001, 'F', 7, 7, 'VIP'),
                (5003, 2001, 'A', 1, 1, 'THUONG')
                """);
        insertBooking(6001, 101, 4001, "DA_THANH_TOAN");
        insertBooking(6002, 102, 4001, "DA_THANH_TOAN");
        insertBooking(6003, 101, 4001, "TEST_UNPAID");
        insertBooking(6004, 101, 4002, "DA_THANH_TOAN");
        jdbc.update("""
                insert into dat_ve (id, ma_dat_ve, nguoi_dung_id, suat_chieu_id, kenh, nhan_vien_id,
                                    tong_tien, tien_giam, thanh_tien, trang_thai_dat_ve, thanh_toan_luc, ngay_tao)
                values (6005, 'DETAIL-6005', 101, 4001, 'TAI_QUAY', 105,
                        320000, 20000, 300000, 'DA_THANH_TOAN', ?, ?)
                """, BOOKED_AT.plusMinutes(5), BOOKED_AT);
        // Chèn ghế/giao dịch ngược thứ tự để kiểm tra thứ tự và tránh nhân bản khi ghép hai tập con.
        jdbc.update("""
                insert into ghe_suat_chieu (suat_chieu_id, ghe_id, nguoi_dung_id, dat_ve_id, gia, trang_thai_ghe) values
                (4001, 5002, 101, 6001, 160000, 'DA_THANH_TOAN'),
                (4001, 5001, 101, 6001, 160000, 'DA_THANH_TOAN'),
                (4001, 5003, 102, 6002, 50000, 'DA_THANH_TOAN')
                """);
        jdbc.update("""
                insert into thanh_toan (id, dat_ve_id, phuong_thuc, so_tien, ma_giao_dich,
                                        trang_thai_thanh_toan, thoi_diem) values
                (9002, 6001, 'PAYPAL', 300000, 'DETAIL-TX-2', 'PROVIDER_OK', ?),
                (9001, 6001, 'PAYPAL', 300000, 'DETAIL-TX-1', 'PROVIDER_FAILED', ?),
                (9003, 6002, 'THE', 50000, 'OTHER-TX', 'OTHER_STATUS', ?),
                (9004, 6003, 'PAYPAL', 300000, 'UNPAID-TX', 'UNKNOWN_STATUS', ?)
                """, BOOKED_AT.plusMinutes(5), BOOKED_AT.plusMinutes(1),
                BOOKED_AT.plusMinutes(5), BOOKED_AT.plusMinutes(5));
        memberToken = tokenFor(101L);
    }

    @Test
    void returnsOwnedPaidBookingWithAccurateDetailsAndAllPaymentAttempts() throws Exception {
        detail("DETAIL-6001", memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.bookingCode").value("DETAIL-6001"))
                .andExpect(jsonPath("$.data.channel").value("ONLINE"))
                .andExpect(jsonPath("$.data.bookedAt").value("2026-11-01T10:00:00"))
                .andExpect(jsonPath("$.data.paidAt").value("2026-11-01T10:05:00"))
                .andExpect(jsonPath("$.data.collectedAt").value(nullValue()))
                .andExpect(jsonPath("$.data.bookingStatus").value("DA_THANH_TOAN"))
                .andExpect(jsonPath("$.data.movie.id").value(3001))
                .andExpect(jsonPath("$.data.movie.title").value("Detail Movie"))
                .andExpect(jsonPath("$.data.movie.posterUrl").value("https://example.test/poster.jpg"))
                .andExpect(jsonPath("$.data.movie.durationMinutes").value(166))
                .andExpect(jsonPath("$.data.movie.ageRating").value("T18"))
                .andExpect(jsonPath("$.data.cinema.id").value(1001))
                .andExpect(jsonPath("$.data.cinema.name").value("Detail Cinema"))
                .andExpect(jsonPath("$.data.cinema.address").value("123 Detail Street"))
                .andExpect(jsonPath("$.data.room.id").value(2001))
                .andExpect(jsonPath("$.data.room.name").value("Room 01"))
                .andExpect(jsonPath("$.data.showtime.id").value(4001))
                .andExpect(jsonPath("$.data.showtime.startsAt").value("2026-11-04T14:30:00"))
                .andExpect(jsonPath("$.data.showtime.endsAt").value("2026-11-04T17:16:00"))
                .andExpect(jsonPath("$.data.seatCount").value(2))
                .andExpect(jsonPath("$.data.seats", hasSize(2)))
                .andExpect(jsonPath("$.data.seats[*].seatId", contains(5001, 5002)))
                .andExpect(jsonPath("$.data.seats[*].rowName", contains("F", "F")))
                .andExpect(jsonPath("$.data.seats[*].number", contains(6, 7)))
                .andExpect(jsonPath("$.data.seats[*].type", contains("VIP", "VIP")))
                .andExpect(jsonPath("$.data.seats[*].price", contains(160000, 160000)))
                .andExpect(jsonPath("$.data.subtotal").value(320000))
                .andExpect(jsonPath("$.data.discountAmount").value(20000))
                .andExpect(jsonPath("$.data.totalAmount").value(300000))
                .andExpect(jsonPath("$.data.currency").value("VND"))
                .andExpect(jsonPath("$.data.recipient.name").value("Gift Recipient"))
                .andExpect(jsonPath("$.data.recipient.email").value("gift@example.test"))
                .andExpect(jsonPath("$.data.recipient.phoneNumber").value("0900123456"))
                .andExpect(jsonPath("$.data.payments", hasSize(2)))
                .andExpect(jsonPath("$.data.payments[*].method", contains("PAYPAL", "PAYPAL")))
                .andExpect(jsonPath("$.data.payments[*].amount", contains(300000, 300000)))
                .andExpect(jsonPath("$.data.payments[*].transactionCode", contains("DETAIL-TX-1", "DETAIL-TX-2")))
                .andExpect(jsonPath("$.data.payments[*].status", contains("PROVIDER_FAILED", "PROVIDER_OK")))
                .andExpect(jsonPath("$.data.payments[*].occurredAt",
                        contains("2026-11-01T10:01:00", "2026-11-01T10:05:00")))
                .andExpect(jsonPath("$.data.serverTime").value("2026-11-04T14:30:00"))
                .andExpect(jsonPath("$.data.timeZone").value("Asia/Ho_Chi_Minh"))
                .andExpect(jsonPath("$.data.userId").doesNotExist())
                .andExpect(jsonPath("$.data.bookingId").doesNotExist())
                .andExpect(jsonPath("$.data.qr").doesNotExist())
                .andExpect(jsonPath("$.data.qrCode").doesNotExist())
                .andExpect(jsonPath("$.data.serviceFee").doesNotExist())
                .andExpect(jsonPath("$.data.emailSent").doesNotExist())
                .andExpect(jsonPath("$.data.smsSent").doesNotExist())
                .andExpect(jsonPath("$.data.showtime.scheduledEndsAt").doesNotExist());
    }

    @ParameterizedTest
    @ValueSource(strings = {"MISSING", "DETAIL-6002", "DETAIL-6003", "' OR 1=1 --"})
    void returnsTheSame404ForMissingForeignOrUnpaidBookings(String code) throws Exception {
        expectNotFound(detail(code, memberToken));
    }

    @Test
    void neverUsesClientUserIdToOverrideTheJwtOwner() throws Exception {
        mvc.perform(get(DETAIL_PATH, "DETAIL-6001")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken).param("userId", "102"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingCode").value("DETAIL-6001"));
        expectNotFound(mvc.perform(get(DETAIL_PATH, "DETAIL-6002")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken).param("userId", "102")));
        detail("DETAIL-6002", tokenFor(102L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.seats[*].seatId", contains(5003)))
                .andExpect(jsonPath("$.data.payments[*].transactionCode", contains("OTHER-TX")));
    }

    @Test
    void matchingTheRecipientEmailDoesNotGrantOwnership() throws Exception {
        expectNotFound(detail("DETAIL-6001", tokenFor(103L)));
    }

    @Test
    void returnsEmptyListsAndNullRecipientFieldsWithoutInventingMissingData() throws Exception {
        detail("DETAIL-6005", memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.channel").value("TAI_QUAY"))
                .andExpect(jsonPath("$.data.seatCount").value(0))
                .andExpect(jsonPath("$.data.seats", hasSize(0)))
                .andExpect(jsonPath("$.data.payments", hasSize(0)))
                .andExpect(jsonPath("$.data.recipient.name").value(nullValue()))
                .andExpect(jsonPath("$.data.recipient.email").value(nullValue()))
                .andExpect(jsonPath("$.data.recipient.phoneNumber").value(nullValue()))
                .andExpect(jsonPath("$.data.totalAmount").value(300000))
                .andExpect(jsonPath("$.data.paymentMethod").doesNotExist());
    }

    @Test
    void preservesNullSeatPricesAndUnrecognizedPaymentValues() throws Exception {
        jdbc.update("update ghe_suat_chieu set gia = null where dat_ve_id = 6001 and ghe_id = 5001");
        jdbc.update("update thanh_toan set phuong_thuc = 'DB_METHOD', trang_thai_thanh_toan = 'DB_STATUS' where id = 9002");

        detail("DETAIL-6001", memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.seats[0].price").value(nullValue()))
                .andExpect(jsonPath("$.data.seats[1].price").value(160000))
                .andExpect(jsonPath("$.data.payments[1].method").value("DB_METHOD"))
                .andExpect(jsonPath("$.data.payments[1].status").value("DB_STATUS"))
                .andExpect(jsonPath("$.data.totalAmount").value(300000));
    }

    @Test
    void calculatesMovieEndAcrossMidnightWithoutCleanupTime() throws Exception {
        detail("DETAIL-6004", memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.showtime.startsAt").value("2026-11-04T23:30:00"))
                .andExpect(jsonPath("$.data.showtime.endsAt").value("2026-11-05T02:16:00"));
        assertThat(jdbc.queryForObject("select ket_thuc from suat_chieu where id = 4002", LocalDateTime.class))
                .isEqualTo(LocalDateTime.of(2026, 11, 5, 2, 31));
    }

    @Test
    void returnsCollectedTicketsWithoutUpdatingTheCollectionTime() throws Exception {
        LocalDateTime collectedAt = STARTS_AT.minusMinutes(10);
        jdbc.update("update dat_ve set nhan_ve_luc = ? where id = 6001", collectedAt);

        detail("DETAIL-6001", memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.bookingStatus").value("DA_THANH_TOAN"))
                .andExpect(jsonPath("$.data.collectedAt").value("2026-11-04T14:20:00"));
        assertThat(jdbc.queryForObject("select nhan_ve_luc from dat_ve where id = 6001", LocalDateTime.class))
                .isEqualTo(collectedAt);
    }

    @Test
    void retainsHistoryWhenRelatedRecordsAreSoftDeletedAndMovieHasStoppedShowing() throws Exception {
        jdbc.update("update phim set trang_thai = 2, ngay_ket_thuc = '2020-12-31' where id = 3001");
        jdbc.update("update rap set trang_thai = 2 where id = 1001");
        jdbc.update("update phong_chieu set trang_thai = 2 where id = 2001");
        jdbc.update("update suat_chieu set trang_thai = 2 where id = 4001");
        jdbc.update("update ghe set trang_thai = 2 where id = 5001");

        detail("DETAIL-6001", memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.movie.title").value("Detail Movie"))
                .andExpect(jsonPath("$.data.seats", hasSize(2)))
                .andExpect(jsonPath("$.data.payments", hasSize(2)));
    }

    @Test
    void rejectsMissingJwt() throws Exception {
        mvc.perform(get(DETAIL_PATH, "DETAIL-6001"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Bearer invalid", "Bearer bad.token.value", "Basic invalid"})
    void rejectsInvalidAuthorization(String authorization) throws Exception {
        mvc.perform(get(DETAIL_PATH, "DETAIL-6001").header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void rejectsExpiredJwtWithAnOtherwiseValidSignature() throws Exception {
        String expired = Jwts.builder().subject("detail_owner")
                .expiration(Date.from(Instant.parse("2000-01-01T00:00:00Z")))
                .signWith(Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8)))
                .compact();

        detail("DETAIL-6001", expired)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void rejectsJwtSignedWithAnotherKey() throws Exception {
        String wrongSignature = Jwts.builder().subject("detail_owner")
                .expiration(Date.from(Instant.now().plusSeconds(3600)))
                .signWith(Keys.hmacShaKeyFor("another-test-only-signing-key-at-least-256-bits".getBytes(StandardCharsets.UTF_8)))
                .compact();

        detail("DETAIL-6001", wrongSignature)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @ParameterizedTest
    @ValueSource(longs = {104L, 105L})
    void rejectsAuthenticatedNonMembers(long userId) throws Exception {
        detail("DETAIL-6001", tokenFor(userId))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @Test
    void doesNotExposeAVersionedAlias() throws Exception {
        mvc.perform(get("/api/v1/me/bookings/DETAIL-6001")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken))
                .andExpect(status().isNotFound());
    }

    private void expectNotFound(ResultActions result) throws Exception {
        result.andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.errorCode").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("Không tìm thấy vé đã mua."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    private ResultActions detail(String code, String token) throws Exception {
        return mvc.perform(get(DETAIL_PATH, code).header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    private String tokenFor(long userId) {
        return tokens.generateAccessToken(users.findById(userId).orElseThrow());
    }

    private void insertBooking(long id, long userId, long showtimeId, String bookingStatus) {
        jdbc.update("""
                insert into dat_ve (id, ma_dat_ve, nguoi_dung_id, suat_chieu_id, kenh,
                                    ten_nguoi_nhan, sdt_nguoi_nhan, email_nguoi_nhan,
                                    tong_tien, tien_giam, thanh_tien, trang_thai_dat_ve, thanh_toan_luc, ngay_tao)
                values (?, ?, ?, ?, 'ONLINE', 'Gift Recipient', '0900123456', 'gift@example.test',
                        320000, 20000, 300000, ?, ?, ?)
                """, id, "DETAIL-" + id, userId, showtimeId, bookingStatus, BOOKED_AT.plusMinutes(5), BOOKED_AT);
    }
}
