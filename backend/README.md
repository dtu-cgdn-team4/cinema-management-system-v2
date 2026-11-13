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

- `db/migration/`: script Flyway `V1__khoi_tao_csdl.sql`, `V2__...`
- `templates/mail/`: mẫu email vé QR, OTP

## MySQL 8 và Flyway (môi trường local)

Yêu cầu: MySQL Server 8.0, MySQL Workbench, Java 17+ và Maven. Trên kết nối quản trị trong Workbench, tạo database và tài khoản ứng dụng:

```sql
CREATE DATABASE cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cinema_app'@'localhost' IDENTIFIED BY '<mat_khau_rieng>';
GRANT ALL PRIVILEGES ON cinema_db.* TO 'cinema_app'@'localhost';
```

Thay `<mat_khau_rieng>` bằng mật khẩu local, không commit mật khẩu thật. Tài khoản cần quyền tạo bảng và index để Flyway chạy migration. Sao chép `.env.example` thành `backend/.env`, đặt `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_NAME=cinema_db`, `DB_USER=cinema_app` và `DB_PASSWORD` trùng mật khẩu vừa tạo. `.env` được Git ignore. Nếu MySQL trên máy chỉ chấp nhận kết nối IPv6 (như môi trường Windows đã kiểm chứng), đặt `DB_HOST=[::1]` thay cho `127.0.0.1`.

Chạy `mvn spring-boot:run` từ thư mục `backend/` để Spring nạp `.env`. Flyway tự áp dụng `V1__khoi_tao_csdl.sql` trên database trống; Hibernate chỉ kiểm tra mapping với `ddl-auto: validate`. Không import V1 bằng tay. Trong Workbench, làm mới mục **SCHEMAS** rồi kiểm tra `cinema_db` bằng `SHOW TABLES;`, `SELECT version, success FROM flyway_schema_history;` và `SELECT COUNT(*) FROM bang_gia WHERE loai_ghe = 'THUONG';`. Kết quả mong đợi là 16 bảng nghiệp vụ cộng `flyway_schema_history`, migration V1 thành công và 7 dòng giá ghế thường. Khởi động backend lần hai không áp dụng lại V1.

Nếu `cinema_db` đã có dữ liệu hoặc migration history, kiểm tra trạng thái trước khi chạy backend; không xóa database hay chạy lại V1 bằng tay.

## Đăng ký với Firebase Phone OTP

`POST /api/v1/auth/register` yêu cầu thêm `firebaseIdToken`. Firebase Authentication xác nhận mã OTP trước, sau đó ứng dụng gửi ID token nhận được cùng dữ liệu đăng ký. Backend kiểm tra chữ ký token, phương thức đăng nhập bằng số điện thoại và đối chiếu số trong token (`+84...`) với `phoneNumber` (`0...`) trước khi lưu tài khoản. Backend không nhận mã OTP trực tiếp.

- Firebase thật: bật Authentication > Phone, đặt `FIREBASE_PROJECT_ID` trong `backend/.env`, rồi đặt biến môi trường `GOOGLE_APPLICATION_CREDENTIALS` trỏ đến service account JSON nằm ngoài repository. Không commit khóa này. Có thể thêm số điện thoại thử nghiệm và mã cố định trong Firebase Console; những số đó không gửi SMS thật.
- Firebase Auth Emulator: đặt `FIREBASE_PROJECT_ID=demo-cinema` trong `backend/.env` và `FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099` trong shell chạy backend. Khởi động emulator bằng `firebase emulators:start --only auth --project demo-cinema` tại thư mục `backend/`. Chế độ này không cần service account hoặc tài khoản thanh toán, và không gửi SMS. **Không đặt `FIREBASE_AUTH_EMULATOR_HOST` trên production:** Admin SDK sẽ chấp nhận token không có chữ ký từ emulator.
- Hướng dẫn kiểm tra toàn bộ luồng bằng Postman (không cần FE): `docs/api/registration-otp-postman.md`.
