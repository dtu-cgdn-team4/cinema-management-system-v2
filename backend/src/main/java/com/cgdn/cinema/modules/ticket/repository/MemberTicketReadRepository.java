package com.cgdn.cinema.modules.ticket.repository;

import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Booking;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.BookingView;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Counts;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Detail;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Movie;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Payment;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Recipient;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Seat;
import com.cgdn.cinema.modules.ticket.repository.MemberTicketReadModel.Showtime;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

/**
 * Chỉ đọc đơn đã thanh toán theo chủ sở hữu trong dat_ve.nguoi_dung_id.
 * userId phải được tầng gọi lấy từ principal đã xác thực, không lấy từ tham số của client.
 */
@Repository
@Transactional(readOnly = true)
public class MemberTicketReadRepository {

    // V1 lưu trạng thái dạng VARCHAR; giá trị đơn đã mua được mô tả trong docs/database/database.md.
    private static final String PAID_STATUS = "DA_THANH_TOAN";

    private static final String BOOKING_COLUMNS = """
            b.id as booking_id, b.ma_dat_ve as booking_code, b.kenh as channel,
            b.ngay_tao as created_at, b.thanh_toan_luc as paid_at, b.nhan_ve_luc as collected_at,
            b.trang_thai_dat_ve as booking_status,
            b.tong_tien as subtotal, b.tien_giam as discount_amount, b.thanh_tien as total_amount,
            (select count(*) from ghe_suat_chieu booked_seat where booked_seat.dat_ve_id = b.id) as seat_count,
            movie.id as movie_id, movie.ten_phim as movie_title, movie.poster_url,
            movie.thoi_luong as duration_minutes, movie.nhan_tuoi as age_rating,
            showtime.id as showtime_id, showtime.bat_dau as starts_at, showtime.ket_thuc as scheduled_ends_at,
            room.id as room_id, room.ten_phong as room_name,
            cinema.id as cinema_id, cinema.ten_rap as cinema_name, cinema.dia_chi as cinema_address
            """;

    // Không lọc ngày chiếu hoặc cờ xóa mềm của phim/rạp/phòng/suất để giữ lịch sử đơn đã mua.
    private static final String BOOKING_FROM = """
            from dat_ve b
            join suat_chieu showtime on showtime.id = b.suat_chieu_id
            join phim movie on movie.id = showtime.phim_id
            join phong_chieu room on room.id = showtime.phong_chieu_id
            join rap cinema on cinema.id = room.rap_id
            where b.nguoi_dung_id = :userId and b.trang_thai_dat_ve = :paidStatus
            """;

    private static final String COUNT_BOOKINGS = "select count(*) " + BOOKING_FROM;

    private static final String BOOKING_PAGINATION = """
            order by b.ngay_tao desc, b.id desc
            limit :limit offset :offset
            """;

    private static final String COUNT_VIEWS = """
            select count(*) as all_count,
                   coalesce(sum(case when showtime.bat_dau > :now then 1 else 0 end), 0) as upcoming_count,
                   coalesce(sum(case when showtime.bat_dau <= :now then 1 else 0 end), 0) as history_count
            """ + BOOKING_FROM;

    private static final String FIND_BOOKING = "select " + BOOKING_COLUMNS + """
            , b.ten_nguoi_nhan as recipient_name, b.email_nguoi_nhan as recipient_email,
              b.sdt_nguoi_nhan as recipient_phone
            """ + BOOKING_FROM + " and b.ma_dat_ve = :bookingCode";

    private static final String FIND_SEATS = """
            select seat.id as seat_id, seat.ten_hang as row_name, seat.so_ghe as seat_number,
                   seat.loai_ghe as seat_type, booked_seat.gia as seat_price
            from ghe_suat_chieu booked_seat
            join ghe seat on seat.id = booked_seat.ghe_id
            join dat_ve b on b.id = booked_seat.dat_ve_id
            where b.id = :bookingId and b.nguoi_dung_id = :userId
              and b.trang_thai_dat_ve = :paidStatus
            order by seat.ten_hang, seat.so_ghe, seat.id
            """;

    private static final String FIND_PAYMENTS = """
            select payment.id, payment.phuong_thuc, payment.so_tien, payment.ma_giao_dich,
                   payment.trang_thai_thanh_toan, payment.thoi_diem
            from thanh_toan payment
            join dat_ve b on b.id = payment.dat_ve_id
            where b.id = :bookingId and b.nguoi_dung_id = :userId
              and b.trang_thai_dat_ve = :paidStatus
            order by payment.thoi_diem, payment.id
            """;

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public MemberTicketReadRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /** pageNumber bắt đầu từ 0; thứ tự cố định theo ngày đặt mới nhất, sau đó ID giảm dần. */
    public Page<Booking> findPaidBookingsByUserId(long userId, int pageNumber, int pageSize) {
        return findPaidBookingsByUserId(userId, pageNumber, pageSize, BookingView.ALL, null);
    }

    /** Lọc trong SQL trước khi đếm/phân trang. now bắt buộc khi chọn UPCOMING hoặc HISTORY. */
    public Page<Booking> findPaidBookingsByUserId(
            long userId, int pageNumber, int pageSize, BookingView view, LocalDateTime now) {
        MapSqlParameterSource parameters = userParameters(userId);
        Assert.notNull(view, "view must not be null");
        if (view != BookingView.ALL) {
            Assert.notNull(now, "now must not be null for a time-filtered view");
        }
        String viewFilter = switch (view) {
            case ALL -> "";
            case UPCOMING -> " and showtime.bat_dau > :now\n";
            case HISTORY -> " and showtime.bat_dau <= :now\n";
        };
        parameters.addValue("now", now);
        PageRequest pageable = PageRequest.of(pageNumber, pageSize,
                Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        long total = jdbcTemplate.queryForObject(COUNT_BOOKINGS + viewFilter, parameters, Long.class);
        if (total == 0 || pageable.getOffset() >= total) {
            return new PageImpl<>(List.of(), pageable, total);
        }

        parameters.addValue("limit", pageable.getPageSize()).addValue("offset", pageable.getOffset());
        List<Booking> bookings = jdbcTemplate.query(
                "select " + BOOKING_COLUMNS + BOOKING_FROM + viewFilter + BOOKING_PAGINATION, parameters,
                (resultSet, rowNumber) -> readBooking(resultSet));
        return new PageImpl<>(bookings, pageable, total);
    }

    /** Đếm trên toàn bộ đơn hợp lệ của thành viên, không phụ thuộc view hoặc trang đang xem. */
    public Counts countPaidBookingsByUserId(long userId, LocalDateTime now) {
        MapSqlParameterSource parameters = userParameters(userId);
        Assert.notNull(now, "now must not be null");
        parameters.addValue("now", now);
        return jdbcTemplate.queryForObject(COUNT_VIEWS, parameters,
                (resultSet, rowNumber) -> new Counts(resultSet.getLong("all_count"),
                        resultSet.getLong("upcoming_count"), resultSet.getLong("history_count")));
    }

    /** Không cung cấp truy vấn ghế/giao dịch công khai chỉ theo ID đơn, tránh bỏ qua chủ sở hữu. */
    public Optional<Detail> findPaidBookingByCodeAndUserId(String bookingCode, long userId) {
        MapSqlParameterSource parameters = userParameters(userId);
        Assert.hasText(bookingCode, "bookingCode must not be blank");
        parameters.addValue("bookingCode", bookingCode);
        Optional<DetailHeader> header = jdbcTemplate.query(FIND_BOOKING, parameters,
                (resultSet, rowNumber) -> new DetailHeader(readBooking(resultSet),
                        new Recipient(resultSet.getString("recipient_name"), resultSet.getString("recipient_email"),
                                resultSet.getString("recipient_phone")))).stream().findFirst();

        return header.map(value -> {
            parameters.addValue("bookingId", value.booking().id());
            // Tách hai tập con để số giao dịch không nhân bản ghế hoặc số tiền của đơn.
            List<Seat> seats = jdbcTemplate.query(FIND_SEATS, parameters,
                    (resultSet, rowNumber) -> new Seat(resultSet.getLong("seat_id"), resultSet.getString("row_name"),
                            resultSet.getInt("seat_number"), resultSet.getString("seat_type"),
                            resultSet.getBigDecimal("seat_price")));
            List<Payment> payments = jdbcTemplate.query(FIND_PAYMENTS, parameters,
                    (resultSet, rowNumber) -> new Payment(resultSet.getLong("id"), resultSet.getString("phuong_thuc"),
                            resultSet.getBigDecimal("so_tien"), resultSet.getString("ma_giao_dich"),
                            resultSet.getString("trang_thai_thanh_toan"),
                            resultSet.getObject("thoi_diem", LocalDateTime.class)));
            return new Detail(value.booking(), value.recipient(), seats, payments);
        });
    }

    private MapSqlParameterSource userParameters(long userId) {
        Assert.isTrue(userId > 0, "userId must be positive");
        return new MapSqlParameterSource("userId", userId).addValue("paidStatus", PAID_STATUS);
    }

    private Booking readBooking(ResultSet resultSet) throws SQLException {
        return new Booking(resultSet.getLong("booking_id"), resultSet.getString("booking_code"),
                resultSet.getString("channel"), resultSet.getObject("created_at", LocalDateTime.class),
                resultSet.getObject("paid_at", LocalDateTime.class), resultSet.getObject("collected_at", LocalDateTime.class),
                resultSet.getString("booking_status"), resultSet.getBigDecimal("subtotal"),
                resultSet.getBigDecimal("discount_amount"), resultSet.getBigDecimal("total_amount"),
                resultSet.getLong("seat_count"),
                new Movie(resultSet.getLong("movie_id"), resultSet.getString("movie_title"),
                        resultSet.getString("poster_url"), resultSet.getInt("duration_minutes"),
                        resultSet.getString("age_rating")),
                new Showtime(resultSet.getLong("showtime_id"), resultSet.getObject("starts_at", LocalDateTime.class),
                        resultSet.getObject("scheduled_ends_at", LocalDateTime.class), resultSet.getLong("room_id"),
                        resultSet.getString("room_name"), resultSet.getLong("cinema_id"),
                        resultSet.getString("cinema_name"), resultSet.getString("cinema_address")));
    }

    private record DetailHeader(Booking booking, Recipient recipient) {
    }
}
