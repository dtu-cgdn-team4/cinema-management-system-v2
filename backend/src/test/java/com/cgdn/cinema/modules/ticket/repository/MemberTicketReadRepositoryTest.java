package com.cgdn.cinema.modules.ticket.repository;

import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Booking;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Payment;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Seat;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.JdbcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

/** Dùng migration thật trên H2 riêng; dữ liệu mỗi test được rollback, không tải auth/Firebase. */
@JdbcTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:member_ticket_read_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.flyway.enabled=true",
        "spring.flyway.locations=classpath:db/migration"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(MemberTicketReadRepository.class)
class MemberTicketReadRepositoryTest {

    private static final long MEMBER_ID = 101L;
    private static final long OTHER_MEMBER_ID = 102L;
    private static final LocalDateTime CREATED_AT = LocalDateTime.of(2026, 11, 1, 10, 0);
    private static final LocalDateTime STARTS_AT = LocalDateTime.of(2026, 11, 4, 14, 30);

    @Autowired
    private MemberTicketReadRepository repository;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void createFixture() {
        jdbc.update("""
                insert into nguoi_dung (id, tai_khoan, ho_ten, email, vai_tro) values
                (101, 'ticket_owner', 'Ticket Owner', 'owner@example.test', 'KHACH_HANG'),
                (102, 'ticket_other', 'Other Member', 'other@example.test', 'KHACH_HANG'),
                (103, 'ticket_empty', 'Empty Member', 'empty@example.test', 'KHACH_HANG')
                """);
        jdbc.update("""
                insert into rap (id, ten_rap, thanh_pho, dia_chi, so_dien_thoai,
                                 gio_mo_cua, gio_dong_cua, hinh_anh_url)
                values (1001, 'Ticket Cinema', 'Da Nang', '123 Test Street', '0236000000',
                        '08:00:00', '23:30:00', 'https://example.test/cinema.jpg')
                """);
        jdbc.update("""
                insert into nguoi_dung (id, tai_khoan, ho_ten, email, vai_tro, rap_id)
                values (104, 'ticket_staff', 'Ticket Staff', 'staff@example.test', 'NHAN_VIEN', 1001)
                """);
        jdbc.update("""
                insert into phong_chieu (id, rap_id, ten_phong, so_hang, so_cot)
                values (2001, 1001, 'Room 01', 6, 10)
                """);
        jdbc.update("""
                insert into phim (id, ten_phim, thoi_luong, nhan_tuoi, ngay_khoi_chieu, ngay_ket_thuc,
                                  dao_dien, dien_vien, hang_san_xuat, trailer_url, poster_url, noi_dung)
                values (3001, 'Ticket Movie', 166, 'T16', '2020-01-01', '2099-12-31',
                        'Director', 'Actor', 'Studio', 'https://example.test/trailer',
                        'https://example.test/poster.jpg', 'Test movie')
                """);
        jdbc.update("""
                insert into suat_chieu (id, phim_id, phong_chieu_id, bat_dau, ket_thuc)
                values (4001, 3001, 2001, ?, ?)
                """, STARTS_AT, STARTS_AT.plusMinutes(181));
        jdbc.update("""
                insert into ghe (id, phong_chieu_id, ten_hang, so_ghe, vi_tri_cot, loai_ghe) values
                (5001, 2001, 'F', 6, 6, 'VIP'), (5002, 2001, 'F', 7, 7, 'VIP'),
                (5003, 2001, 'F', 8, 8, 'THUONG')
                """);
    }

    @Test
    void returnsEmptyPageForMemberWithoutBookings() {
        insertBooking(6001, OTHER_MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");

        var page = repository.findPaidBookingsByUserId(103L, 0, 10);

        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isZero();
        assertThat(page.getTotalPages()).isZero();
    }

    @Test
    void paginatesOnlyOwnedPaidBookingsInStableOrder() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertBooking(6002, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertBooking(6003, MEMBER_ID, CREATED_AT.plusDays(1), "DA_THANH_TOAN");
        insertBooking(6004, OTHER_MEMBER_ID, CREATED_AT.plusDays(2), "DA_THANH_TOAN");
        // Giá trị khác trạng thái đã mua chỉ là dữ liệu kiểm thử, không định nghĩa nghiệp vụ mới.
        insertBooking(6005, MEMBER_ID, CREATED_AT.plusDays(3), "TEST_UNPAID");

        var first = repository.findPaidBookingsByUserId(MEMBER_ID, 0, 2);
        var second = repository.findPaidBookingsByUserId(MEMBER_ID, 1, 2);

        assertThat(first.getContent()).extracting(Booking::id).containsExactly(6003L, 6002L);
        assertThat(first.getTotalElements()).isEqualTo(3);
        assertThat(first.getTotalPages()).isEqualTo(2);
        assertThat(first.isLast()).isFalse();
        assertThat(second.getContent()).extracting(Booking::id).containsExactly(6001L);
        assertThat(second.getTotalElements()).isEqualTo(3);
        assertThat(second.isLast()).isTrue();
    }

    @Test
    void retainsTotalCountForPageBeyondLastIncludingLargeOffset() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");

        var page = repository.findPaidBookingsByUserId(MEMBER_ID, Integer.MAX_VALUE, 2);

        assertThat(page.getContent()).isEmpty();
        assertThat(page.getTotalElements()).isEqualTo(1);
    }

    @Test
    void readsStoredAmountsAndKeepsSeatsSeparateFromMultiplePayments() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertSeat(6001, 5002, new BigDecimal("160000"));
        insertSeat(6001, 5001, new BigDecimal("160000"));
        insertPayment(9002, 6001, "PROVIDER_OK", CREATED_AT.plusMinutes(5));
        insertPayment(9001, 6001, "PROVIDER_FAILED", CREATED_AT.plusMinutes(1));

        var detail = repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID).orElseThrow();
        var booking = detail.booking();

        assertThat(booking.id()).isEqualTo(6001);
        assertThat(booking.bookingCode()).isEqualTo("MEMBER-6001");
        assertThat(booking.channel()).isEqualTo("ONLINE");
        assertThat(booking.createdAt()).isEqualTo(CREATED_AT);
        assertThat(booking.paidAt()).isEqualTo(CREATED_AT.plusMinutes(5));
        assertThat(booking.collectedAt()).isNull();
        assertThat(booking.status()).isEqualTo("DA_THANH_TOAN");
        assertThat(booking.subtotal()).isEqualByComparingTo("320000");
        assertThat(booking.discountAmount()).isEqualByComparingTo("20000");
        assertThat(booking.totalAmount()).isEqualByComparingTo("300000");
        assertThat(booking.seatCount()).isEqualTo(2);
        assertThat(booking.movie().id()).isEqualTo(3001);
        assertThat(booking.movie().title()).isEqualTo("Ticket Movie");
        assertThat(booking.movie().posterUrl()).isEqualTo("https://example.test/poster.jpg");
        assertThat(booking.movie().durationMinutes()).isEqualTo(166);
        assertThat(booking.movie().ageRating()).isEqualTo("T16");
        assertThat(booking.showtime().id()).isEqualTo(4001);
        assertThat(booking.showtime().startsAt()).isEqualTo(STARTS_AT);
        assertThat(booking.showtime().scheduledEndsAt()).isEqualTo(STARTS_AT.plusMinutes(181));
        assertThat(booking.showtime().roomId()).isEqualTo(2001);
        assertThat(booking.showtime().roomName()).isEqualTo("Room 01");
        assertThat(booking.showtime().cinemaId()).isEqualTo(1001);
        assertThat(booking.showtime().cinemaName()).isEqualTo("Ticket Cinema");
        assertThat(booking.showtime().cinemaAddress()).isEqualTo("123 Test Street");
        assertThat(detail.recipient().name()).isEqualTo("Gift Recipient");
        assertThat(detail.recipient().email()).isEqualTo("recipient@example.test");
        assertThat(detail.recipient().phoneNumber()).isEqualTo("0900123456");
        assertThat(detail.seats()).extracting(Seat::seatId).containsExactly(5001L, 5002L);
        assertThat(detail.seats().get(0).rowName()).isEqualTo("F");
        assertThat(detail.seats().get(0).number()).isEqualTo(6);
        assertThat(detail.seats().get(0).type()).isEqualTo("VIP");
        assertThat(detail.seats()).allSatisfy(seat -> assertThat(seat.price()).isEqualByComparingTo("160000"));
        assertThat(detail.payments()).extracting(Payment::id).containsExactly(9001L, 9002L);
        assertThat(detail.payments()).extracting(Payment::status).containsExactly("PROVIDER_FAILED", "PROVIDER_OK");
        assertThat(detail.payments().get(1).method()).isEqualTo("PAYPAL");
        assertThat(detail.payments().get(1).amount()).isEqualByComparingTo("300000");
        assertThat(detail.payments().get(1).transactionCode()).isEqualTo("TX-9002");
        assertThat(detail.payments().get(1).occurredAt()).isEqualTo(CREATED_AT.plusMinutes(5));

        var page = repository.findPaidBookingsByUserId(MEMBER_ID, 0, 10);
        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).seatCount()).isEqualTo(2);
        assertThat(page.getContent().get(0).totalAmount()).isEqualByComparingTo("300000");
    }

    @Test
    void neverIncludesSeatsOrPaymentsFromAnotherBooking() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertBooking(6002, OTHER_MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertBooking(6003, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertSeat(6001, 5001, new BigDecimal("160000"));
        insertSeat(6002, 5002, new BigDecimal("90000"));
        insertSeat(6003, 5003, new BigDecimal("50000"));
        insertPayment(9001, 6001, "PROVIDER_OK", CREATED_AT);
        insertPayment(9002, 6002, "PROVIDER_OK", CREATED_AT);
        insertPayment(9003, 6003, "PROVIDER_OK", CREATED_AT);

        var detail = repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID).orElseThrow();

        assertThat(detail.seats()).extracting(Seat::seatId).containsExactly(5001L);
        assertThat(detail.payments()).extracting(Payment::id).containsExactly(9001L);
        assertThat(repository.findPaidBookingByCodeAndUserId("MEMBER-6001", OTHER_MEMBER_ID)).isEmpty();
        assertThat(repository.findPaidBookingByCodeAndUserId("MEMBER-6002", MEMBER_ID)).isEmpty();
    }

    @Test
    void returnsEmptyForMissingOrNonPaidBooking() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "TEST_UNPAID");

        assertThat(repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID)).isEmpty();
        assertThat(repository.findPaidBookingByCodeAndUserId("MISSING", MEMBER_ID)).isEmpty();
    }

    @Test
    void bindsBookingCodeAsDataRatherThanSql() {
        insertBooking(6001, OTHER_MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");

        assertThat(repository.findPaidBookingByCodeAndUserId("' OR 1=1 --", MEMBER_ID)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(ints = {1, 2})
    void keepsBookingsForEndedOrSoftDeletedMovie(int movieStatus) {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        jdbc.update("update phim set ngay_ket_thuc = '2020-12-31', trang_thai = ? where id = 3001", movieStatus);
        jdbc.update("update suat_chieu set bat_dau = '2020-11-04 14:30:00', ket_thuc = '2020-11-04 17:31:00' where id = 4001");

        assertThat(repository.findPaidBookingsByUserId(MEMBER_ID, 0, 10).getContent())
                .extracting(Booking::id).containsExactly(6001L);
        assertThat(repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID)).isPresent();
    }

    @Test
    void keepsHistoryWhenCinemaRoomShowtimeOrSeatIsSoftDeleted() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertSeat(6001, 5001, new BigDecimal("160000"));
        jdbc.update("update rap set trang_thai = 2 where id = 1001");
        jdbc.update("update phong_chieu set trang_thai = 2 where id = 2001");
        jdbc.update("update suat_chieu set trang_thai = 2 where id = 4001");
        jdbc.update("update ghe set trang_thai = 2 where id = 5001");

        var detail = repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID).orElseThrow();

        assertThat(detail.seats()).extracting(Seat::seatId).containsExactly(5001L);
        assertThat(repository.findPaidBookingsByUserId(MEMBER_ID, 0, 10).getTotalElements()).isEqualTo(1);
    }

    @Test
    void excludesAnonymousCounterBookingEvenWithSameRecipient() {
        insertBooking(6001, null, CREATED_AT, "DA_THANH_TOAN");

        assertThat(repository.findPaidBookingsByUserId(MEMBER_ID, 0, 10).getContent()).isEmpty();
        assertThat(repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID)).isEmpty();
    }

    @Test
    void allowsLinkedCounterBookingAndNullableRecipient() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        jdbc.update("""
                update dat_ve set kenh = 'TAI_QUAY', nhan_vien_id = 104,
                ten_nguoi_nhan = null, email_nguoi_nhan = null, sdt_nguoi_nhan = null where id = 6001
                """);

        var detail = repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID).orElseThrow();

        assertThat(detail.booking().channel()).isEqualTo("TAI_QUAY");
        assertThat(detail.recipient().name()).isNull();
        assertThat(detail.recipient().email()).isNull();
        assertThat(detail.recipient().phoneNumber()).isNull();
        assertThat(repository.findPaidBookingsByUserId(MEMBER_ID, 0, 10).getTotalElements()).isEqualTo(1);
    }

    @Test
    void preservesCollectedAtAndNullSeatPriceWithoutInventingPayments() {
        insertBooking(6001, MEMBER_ID, CREATED_AT, "DA_THANH_TOAN");
        insertSeat(6001, 5001, null);
        jdbc.update("update dat_ve set nhan_ve_luc = ? where id = 6001", STARTS_AT.minusMinutes(10));

        var detail = repository.findPaidBookingByCodeAndUserId("MEMBER-6001", MEMBER_ID).orElseThrow();

        assertThat(detail.booking().collectedAt()).isEqualTo(STARTS_AT.minusMinutes(10));
        assertThat(detail.seats()).hasSize(1);
        assertThat(detail.seats().get(0).price()).isNull();
        assertThat(detail.payments()).isEmpty();
    }

    @Test
    void rejectsInvalidOwnerOrPaginationRatherThanRunningUnscopedQuery() {
        assertThatIllegalArgumentException().isThrownBy(() -> repository.findPaidBookingsByUserId(0L, 0, 10));
        assertThatIllegalArgumentException().isThrownBy(() -> repository.findPaidBookingByCodeAndUserId("CODE", -1L));
        assertThatIllegalArgumentException().isThrownBy(() -> repository.findPaidBookingsByUserId(MEMBER_ID, -1, 10));
        assertThatIllegalArgumentException().isThrownBy(() -> repository.findPaidBookingsByUserId(MEMBER_ID, 0, 0));
        assertThatIllegalArgumentException().isThrownBy(() -> repository.findPaidBookingByCodeAndUserId(" ", MEMBER_ID));
    }

    private void insertBooking(long id, Long userId, LocalDateTime createdAt, String status) {
        jdbc.update("""
                insert into dat_ve (id, ma_dat_ve, nguoi_dung_id, suat_chieu_id, kenh, nhan_vien_id,
                                    ten_nguoi_nhan, sdt_nguoi_nhan, email_nguoi_nhan,
                                    tong_tien, tien_giam, thanh_tien, trang_thai_dat_ve, thanh_toan_luc, ngay_tao)
                values (?, ?, ?, 4001, ?, ?, 'Gift Recipient', '0900123456', 'recipient@example.test',
                        320000, 20000, 300000, ?, ?, ?)
                """, id, "MEMBER-" + id, userId, userId == null ? "TAI_QUAY" : "ONLINE",
                userId == null ? 104L : null, status, createdAt.plusMinutes(5), createdAt);
    }

    private void insertSeat(long bookingId, long seatId, BigDecimal price) {
        jdbc.update("""
                insert into ghe_suat_chieu (suat_chieu_id, ghe_id, nguoi_dung_id, dat_ve_id, gia, trang_thai_ghe)
                select b.suat_chieu_id, ?, b.nguoi_dung_id, b.id, ?, 'DA_THANH_TOAN'
                from dat_ve b where b.id = ?
                """, seatId, price, bookingId);
    }

    private void insertPayment(long id, long bookingId, String status, LocalDateTime occurredAt) {
        jdbc.update("""
                insert into thanh_toan (id, dat_ve_id, phuong_thuc, so_tien, ma_giao_dich,
                                        trang_thai_thanh_toan, thoi_diem)
                values (?, ?, 'PAYPAL', 300000, ?, ?, ?)
                """, id, bookingId, "TX-" + id, status, occurredAt);
    }
}
