package com.cgdn.cinema.modules.ticket;

import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.security.JwtTokenProvider;
import com.google.firebase.auth.FirebaseAuth;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
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

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Kiểm tra qua SecurityFilterChain/JWT hiện có với DB riêng và dữ liệu rollback sau mỗi test. */
@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:member_ticket_list_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
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
@Import(MemberTicketListIntegrationTest.FixedClockConfiguration.class)
@Transactional
class MemberTicketListIntegrationTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 4, 14, 30);
    private static final LocalDateTime BOOKED_AT = LocalDateTime.of(2026, 11, 1, 10, 0);

    @TestConfiguration(proxyBeanMethods = false)
    static class FixedClockConfiguration {

        @Bean
        @Primary
        Clock memberTicketTestClock() {
            // Cố ý dùng Clock UTC để kiểm tra Service luôn quy đổi sang giờ Việt Nam.
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

    private String memberToken;

    @BeforeEach
    void createFixture() {
        jdbc.update("""
                insert into nguoi_dung (id, tai_khoan, ho_ten, email, vai_tro) values
                (101, 'list_owner', 'List Owner', 'list-owner@example.test', 'KHACH_HANG'),
                (102, 'list_other', 'List Other', 'list-other@example.test', 'KHACH_HANG'),
                (103, 'list_empty', 'List Empty', 'list-empty@example.test', 'KHACH_HANG'),
                (104, 'list_admin', 'List Admin', 'list-admin@example.test', 'ADMIN')
                """);
        jdbc.update("""
                insert into rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai,
                                 gio_mo_cua, gio_dong_cua, hinh_anh_url)
                values (1001, 'List Cinema', 'Da Nang', '123 List Street', '0236000000',
                        '08:00:00', '23:30:00', 'https://example.test/cinema.jpg')
                """);
        jdbc.update("""
                insert into phong_chieu (id, rap_id, ten_phong, so_hang, so_cot)
                values (2001, 1001, 'Room 01', 6, 10)
                """);
        jdbc.update("""
                insert into phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc,
                                  dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung)
                values (3001, 'List Movie', 166, 'T16', '2020-01-01', '2099-12-31',
                        'Director', 'Actor', 'Studio', 'https://example.test/trailer',
                        'https://example.test/poster.jpg', 'List test movie')
                """);
        jdbc.update("""
                insert into suat_chieu (id, phim_id, phong_chieu_id, bat_dau, ket_thuc) values
                (4001, 3001, 2001, ?, ?), (4002, 3001, 2001, ?, ?), (4003, 3001, 2001, ?, ?)
                """, NOW.plusSeconds(1), NOW.plusHours(3), NOW.minusSeconds(1), NOW.plusHours(3), NOW, NOW.plusHours(3));
        jdbc.update("""
                insert into ghe (id, phong_chieu_id, ten_hang, so_ghe, vi_tri_cot, loai_ghe) values
                (5001, 2001, 'F', 6, 6, 'VIP'), (5002, 2001, 'F', 7, 7, 'VIP')
                """);
        insertBooking(6001, 101, 4001, BOOKED_AT, "DA_THANH_TOAN");
        insertBooking(6002, 101, 4001, BOOKED_AT.plusDays(2), "DA_THANH_TOAN");
        insertBooking(6003, 101, 4002, BOOKED_AT.plusDays(1), "DA_THANH_TOAN");
        insertBooking(6004, 101, 4003, BOOKED_AT.plusDays(2), "DA_THANH_TOAN");
        insertBooking(6005, 102, 4001, BOOKED_AT.plusDays(3), "DA_THANH_TOAN");
        insertBooking(6006, 101, 4001, BOOKED_AT.plusDays(4), "TEST_UNPAID");
        jdbc.update("update dat_ve set nhan_ve_luc = ? where id = 6003", NOW.minusMinutes(10));
        jdbc.update("""
                insert into ghe_suat_chieu (suat_chieu_id, ghe_id, nguoi_dung_id, dat_ve_id, gia, trang_thai_ghe) values
                (4001, 5001, 101, 6001, 160000, 'DA_THANH_TOAN'),
                (4001, 5002, 101, 6001, 160000, 'DA_THANH_TOAN')
                """);
        jdbc.update("""
                insert into thanh_toan (id, dat_ve_id, phuong_thuc, so_tien, ma_giao_dich,
                                        trang_thai_thanh_toan, thoi_diem) values
                (9001, 6001, 'PAYPAL', 300000, 'LIST-TX-1', 'PROVIDER_FAILED', ?),
                (9002, 6001, 'PAYPAL', 300000, 'LIST-TX-2', 'PROVIDER_OK', ?)
                """, BOOKED_AT.plusMinutes(1), BOOKED_AT.plusMinutes(5));
        memberToken = tokenFor(101L);
    }

    @Test
    void returnsOnlyOwnedPaidBookingsWithRequiredFieldsAndDefaultPagination() throws Exception {
        list(memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.tickets.pageNo").value(0))
                .andExpect(jsonPath("$.data.tickets.pageSize").value(10))
                .andExpect(jsonPath("$.data.tickets.totalElements").value(4))
                .andExpect(jsonPath("$.data.tickets.totalPages").value(1))
                .andExpect(jsonPath("$.data.tickets.last").value(true))
                .andExpect(jsonPath("$.data.tickets.content[*].bookingCode",
                        contains("LIST-6004", "LIST-6002", "LIST-6003", "LIST-6001")))
                .andExpect(jsonPath("$.data.tickets.content[3].bookedAt").value("2026-11-01T10:00:00"))
                .andExpect(jsonPath("$.data.tickets.content[3].paidAt").value("2026-11-01T10:05:00"))
                .andExpect(jsonPath("$.data.tickets.content[3].movie.id").value(3001))
                .andExpect(jsonPath("$.data.tickets.content[3].movie.title").value("List Movie"))
                .andExpect(jsonPath("$.data.tickets.content[3].movie.posterUrl").value("https://example.test/poster.jpg"))
                .andExpect(jsonPath("$.data.tickets.content[3].showtime.id").value(4001))
                .andExpect(jsonPath("$.data.tickets.content[3].showtime.startsAt").value("2026-11-04T14:30:01"))
                .andExpect(jsonPath("$.data.tickets.content[3].showtime.roomName").value("Room 01"))
                .andExpect(jsonPath("$.data.tickets.content[3].showtime.cinemaName").value("List Cinema"))
                .andExpect(jsonPath("$.data.tickets.content[3].seatCount").value(2))
                .andExpect(jsonPath("$.data.tickets.content[3].totalAmount").value(300000))
                .andExpect(jsonPath("$.data.tickets.content[3].currency").value("VND"))
                .andExpect(jsonPath("$.data.tickets.content[3].bookingStatus").value("DA_THANH_TOAN"))
                .andExpect(jsonPath("$.data.tickets.content[3].collectedAt").value(nullValue()))
                .andExpect(jsonPath("$.data.tickets.content[2].collectedAt").value("2026-11-04T14:20:00"))
                .andExpect(jsonPath("$.data.tickets.content[3].recipient").doesNotExist())
                .andExpect(jsonPath("$.data.tickets.content[3].payments").doesNotExist())
                .andExpect(jsonPath("$.data.serverTime").value("2026-11-04T14:30:00"))
                .andExpect(jsonPath("$.data.timeZone").value("Asia/Ho_Chi_Minh"));
    }

    @Test
    void neverUsesClientUserIdToOverrideAuthenticatedMember() throws Exception {
        mvc.perform(get("/api/me/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken)
                        .param("userId", "102"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tickets.content[*].bookingCode",
                        contains("LIST-6004", "LIST-6002", "LIST-6003", "LIST-6001")));
        list(tokenFor(102L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tickets.content[*].bookingCode", contains("LIST-6005")))
                .andExpect(jsonPath("$.data.counts.all").value(1));
    }

    @Test
    void returnsEmptyListAndZeroCountsForMemberWithoutBookings() throws Exception {
        list(tokenFor(103L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tickets.content", hasSize(0)))
                .andExpect(jsonPath("$.data.tickets.totalElements").value(0))
                .andExpect(jsonPath("$.data.counts.all").value(0))
                .andExpect(jsonPath("$.data.counts.upcoming").value(0))
                .andExpect(jsonPath("$.data.counts.history").value(0));
    }

    @ParameterizedTest
    @CsvSource({"ALL,0,LIST-6004,4", "ALL,1,LIST-6002,4", "UPCOMING,0,LIST-6002,2",
            "UPCOMING,1,LIST-6001,2", "HISTORY,0,LIST-6004,2", "HISTORY,1,LIST-6003,2"})
    void filtersBeforePaginationAndKeepsCountsIndependentOfViewAndPage(
            String view, String page, String expectedCode, int expectedTotal) throws Exception {
        mvc.perform(get("/api/me/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken)
                        .param("view", view).param("page", page).param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tickets.content[*].bookingCode", contains(expectedCode)))
                .andExpect(jsonPath("$.data.tickets.pageNo").value(Integer.parseInt(page)))
                .andExpect(jsonPath("$.data.tickets.pageSize").value(1))
                .andExpect(jsonPath("$.data.tickets.totalElements").value(expectedTotal))
                .andExpect(jsonPath("$.data.tickets.totalPages").value(expectedTotal))
                .andExpect(jsonPath("$.data.counts.all").value(4))
                .andExpect(jsonPath("$.data.counts.upcoming").value(2))
                .andExpect(jsonPath("$.data.counts.history").value(2));
    }

    @Test
    void returnsCountsForOutOfRangePageAndAcceptsMaximumSize() throws Exception {
        mvc.perform(get("/api/me/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken)
                        .param("page", "2147483647").param("size", "100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tickets.content", hasSize(0)))
                .andExpect(jsonPath("$.data.tickets.totalElements").value(4))
                .andExpect(jsonPath("$.data.counts.all").value(4))
                .andExpect(jsonPath("$.data.counts.upcoming").value(2))
                .andExpect(jsonPath("$.data.counts.history").value(2));
    }

    @Test
    void retainsTicketsWhenMovieHasStoppedShowing() throws Exception {
        jdbc.update("update phim set trang_thai = 2, ngay_ket_thuc = '2020-12-31' where id = 3001");

        list(memberToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.tickets.content", hasSize(4)))
                .andExpect(jsonPath("$.data.counts.all").value(4));
    }

    @Test
    void rejectsMissingJwtUsingExistingSecurityConfiguration() throws Exception {
        mvc.perform(get("/api/me/bookings"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Bearer invalid", "Bearer bad.token.value", "Basic invalid"})
    void rejectsInvalidAuthorization(String authorization) throws Exception {
        mvc.perform(get("/api/me/bookings").header(HttpHeaders.AUTHORIZATION, authorization))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void rejectsAuthenticatedNonMember() throws Exception {
        list(tokenFor(104L))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
    }

    @ParameterizedTest
    @CsvSource({"page,-1", "page,abc", "page,1.5", "page,2147483648", "size,0", "size,-1",
            "size,101", "size,abc", "size,1.5", "size,2147483648", "view,INVALID", "view,upcoming"})
    void rejectsInvalidQueryParameters(String parameter, String value) throws Exception {
        mvc.perform(get("/api/me/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken)
                        .param(parameter, value))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
    }

    @Test
    void doesNotExposeVersionedAlias() throws Exception {
        mvc.perform(get("/api/v1/me/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + memberToken))
                .andExpect(status().isNotFound());
    }

    private ResultActions list(String token) throws Exception {
        return mvc.perform(get("/api/me/bookings").header(HttpHeaders.AUTHORIZATION, "Bearer " + token));
    }

    private String tokenFor(long userId) {
        return tokens.generateAccessToken(users.findById(userId).orElseThrow());
    }

    private void insertBooking(long id, long userId, long showtimeId, LocalDateTime createdAt, String bookingStatus) {
        jdbc.update("""
                insert into dat_ve (id, ma_dat_ve, nguoi_dung_id, suat_chieu_id, kenh,
                                    ten_nguoi_nhan, sdt_nguoi_nhan, email_nguoi_nhan,
                                    tong_tien, tien_giam, thanh_tien, trang_thai_dat_ve, thanh_toan_luc, ngay_tao)
                values (?, ?, ?, ?, 'ONLINE', 'Gift Recipient', '0900123456', 'gift@example.test',
                        320000, 20000, 300000, ?, ?, ?)
                """, id, "LIST-" + id, userId, showtimeId, bookingStatus, createdAt.plusMinutes(5), createdAt);
    }
}
