# Backend – Spring Boot

Code chia theo module nghiệp vụ trong `com.cgdn.cinema.modules`. Mỗi người làm trọn một module để tránh conflict.

## Bố cục chung

| Thư mục | Nội dung |
|---|---|
| `common/` | constants, enums, response chung (`ApiResponse<T>`), utils |
| `config/` | CORS, OpenAPI, Jackson, Scheduling |
| `security/` | Spring Security, JWT, Google OAuth2, khóa tài khoản sau 5 lần sai |
| `exception/` | `GlobalExceptionHandler`, `BusinessException`, `ErrorCode` |
| `infrastructure/` | tích hợp bên ngoài: messaging (RabbitMQ), websocket, mail, sms (Firebase), storage (Cloudinary), payment (PayPal), export (Excel, hóa đơn) |
| `modules/` | auth, user, movie, room, showtime, pricing, promotion, booking, payment, counter, ticket, loyalty, report |

## Bố cục một module

```text
modules/<ten-module>/
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
│   ├── request/
│   └── response/
└── mapper/
```

Chỉ thêm thư mục riêng khi module cần, ví dụ `booking/queue/` (xử lý đặt vé qua message queue) và `booking/scheduler/` (nhả ghế giữ quá 10 phút).

## Resources

- `db/migration/`: script Flyway `V1__init.sql`, `V2__...`
- `templates/mail/`: mẫu email vé QR, OTP

## API danh sách phim

Các API cùng dùng `MovieController`, `MovieService`, `MovieRepository` và `MovieMapper`:

| GET | Dữ liệu trả về trong `data` |
|---|---|
| `/api/v1/movies?status=SHOWING` | Mảng phim theo khuôn mẫu `MovieResponse` của develop |
| `/api/v1/movies/now-showing?page=0&size=10` | Trang phim đang chiếu |
| `/api/v1/movies/coming-soon?page=0&size=10` | Trang phim sắp chiếu |
| `/api/v1/movies/genres` | Thể loại cho bộ lọc |

Hai API phân trang nhận thêm `genreId` tùy chọn. Trang bắt đầu từ 0, kích thước mặc định 10, tối đa 100. Không có tham số tìm kiếm tên phim.

JSON phân trang gồm `content`, `pageNo`, `pageSize`, `totalElements`, `totalPages`, `last`. Các phần tử trong `content` dùng `MovieListResponse` với `id`, `tenPhim`, `thoiLuong`, `nhanTuoi`, `ngayKhoiChieu`, `ngayKetThuc`, `posterUrl`, `theLoai`. Giữ DTO riêng cho dữ liệu tóm tắt để API `/api/v1/movies` tiếp tục trả đúng JSON của develop.

Kiểm tra phần danh sách và tính tương thích với API develop:

```powershell
mvn test -Dtest=MovieApiIntegrationTest
```
