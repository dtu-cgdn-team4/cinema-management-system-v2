# API trang chi tiết phim

Backend phục vụ các phần trong ảnh tham chiếu: thông tin phim, trailer, lịch chiếu/đặt vé nhanh và phim liên quan. Tất cả endpoint trả envelope `ApiResponse` gồm `code`, `message`, `data`. Tiền dùng VND; ngày giờ theo `Asia/Ho_Chi_Minh`.

| Method | Endpoint | Mục đích |
|---|---|---|
| GET | `/api/movies/{movieId}` | Thông tin đầu trang, tổng quan, trailer |
| GET | `/api/movies/{movieId}/showtimes` | Ngày, khu vực, rạp, phòng, suất chiếu, giá và ghế trống |
| GET | `/api/movies/{movieId}/related` | Các thẻ phim gợi ý |

Cả ba endpoint hỗ trợ cùng đường dẫn dưới `/api/v1/movies`. Không yêu cầu đăng nhập cho các truy vấn đọc này. Phim không tồn tại hoặc đã xóa mềm trả HTTP 404 trên cả ba endpoint. ID và tham số không hợp lệ trả HTTP 400.

## 1. Thông tin phim

Các field cũ vẫn được giữ: `id`, `title`, `posterUrl`, `director`, `actors`, `genres`, `duration`, `releaseDate`, `ageRating`, `description`, `trailerUrl`, `status`, `showtimes`.

Field bổ sung:

| Field | Ý nghĩa |
|---|---|
| `endDate` | Ngày kết thúc từ `phim.ngay_ket_thuc` |
| `productionCompany` | Hãng sản xuất từ `phim.hang_san_xuat` |
| `screeningStatus` | `UPCOMING`, `NOW_SHOWING`, `ENDED`, suy ra từ ngày chiếu |
| `format` | `2D`, theo phạm vi dự án đã ghi trong tài liệu database |
| `originalTitle` | `null`: schema chưa có tên gốc |
| `backdropUrl` | `null`: schema chưa có ảnh nền |
| `subtitle` | `null`: schema chưa có ngôn ngữ phụ đề |
| `galleryImages` | `[]`: schema chưa có thư viện ảnh |

`status` vẫn là cờ dữ liệu `trang_thai`; không dùng field này để hiển thị nhãn đang chiếu/sắp chiếu. `screeningStatus` tính theo ngày hiện tại tại Việt Nam, bao gồm cả ngày khởi chiếu và ngày kết thúc trong khoảng đang chiếu. Ngày thiếu hoặc không hợp lệ trả trạng thái `null`.

`actors` là danh sách tên tách từ chuỗi diễn viên hiện có. `genres` gồm `id`, `name`. `showtimes` cũ vẫn trả các suất chưa bắt đầu tại phòng/rạp hoạt động; được bổ sung `cinemaCity`, `cinemaAddress`, `movieEndsAt`.

## 2. Lịch chiếu và thông tin đặt vé nhanh

| Query parameter | Bắt buộc | Ý nghĩa |
|---|---|---|
| `date` | Không | Ngày ISO `YYYY-MM-DD`, năm 1000–9999; mặc định hôm nay tại Việt Nam |
| `city` | Không | Giá trị lấy từ `cities`; bỏ khoảng trắng hai đầu |
| `cinemaId` | Không | ID rạp dương; mặc định rạp đầu tiên có lịch trong ngày/khu vực chọn |

Các field trong `data`:

- `movieId`, `date`, `city`, `cinemaId`: bộ lọc đang chọn.
- `currency`: `VND`.
- `availableDates`: ngày có suất chưa bắt đầu cho phim trong khu vực chọn; sắp xếp tăng dần, không tự tạo ngày không có dữ liệu.
- `cities`: khu vực có suất chưa bắt đầu của phim trên toàn hệ thống.
- `cinemas`: danh sách rạp có lịch trong ngày/khu vực chọn, gồm `id`, `name`, `city`, `address`; sắp xếp theo tên rồi ID. Danh sách này vẫn giữ các lựa chọn rạp khác khi đã chọn `cinemaId`.
- `rooms`: phòng thuộc rạp đang chọn, gồm `id`, `name`, `format`, `prices`, `showtimes`.

`prices` gồm `seatType`, `amount`. Giá được lấy từ `bang_gia`, theo thứ ISO của **ngày chiếu được chọn** và loại ghế thực tế đang hoạt động trong phòng. Thiếu giá thì `amount = null`; không thay bằng 0 hoặc giá trong ảnh.

Mỗi suất trong `rooms[].showtimes` gồm:

| Field | Ý nghĩa |
|---|---|
| `id` | ID suất chiếu để chuyển sang bước chọn ghế |
| `startsAt` | Giờ bắt đầu |
| `movieEndsAt` | Giờ bắt đầu + thời lượng phim, không gồm dọn phòng |
| `endsAt` | Giờ kết thúc trong database, đã gồm dọn phòng |
| `totalSeats` | Số ghế hoạt động thật trong phòng |
| `availableSeats` | Số ghế còn trống tại lúc truy vấn |
| `soldOut` | `true` khi không còn ghế trống |

Số ghế trống không suy ra từ số hàng/cột của phòng. Ghế đã thanh toán, đang chờ thanh toán hoặc đang giữ chưa hết hạn được tính là bận. Giữ ghế đã hết hạn được tính lại là trống; bản ghi giữ ghế thiếu thời hạn được giữ là bận để tránh báo nhầm ghế trống. Ghế đã xóa mềm hoặc thuộc phòng khác không được tính.

Chỉ trả suất chưa bắt đầu, chưa xóa mềm, tại phòng/rạp hoạt động. Ngày được lọc theo giờ bắt đầu trong khoảng từ 00:00 của ngày chọn đến trước 00:00 ngày kế tiếp. Không có lịch phù hợp thì HTTP 200 với danh sách rỗng; không có rạp nào tự chọn thì `cinemaId = null`.

Frontend có đủ dữ liệu từ API chi tiết và lịch chiếu để ghép thẻ “Thông tin vé” theo phim/rạp/phòng/suất đang chọn. API này chỉ đọc dữ liệu, không giữ ghế hoặc tạo đơn đặt vé. Số ghế trống là ảnh chụp tại thời điểm truy vấn; bước đặt vé cần kiểm tra lại khả dụng.

## 3. Phim liên quan

`GET /api/movies/{movieId}/related?limit=4`

- `limit` mặc định 4, cho phép từ 1 đến 20.
- Loại phim đang xem, phim đã xóa mềm và phim đã kết thúc.
- Ưu tiên số thể loại chung nhiều nhất, sau đó ngày khởi chiếu mới nhất, rồi ID tăng dần. Phim sắp chiếu vẫn có thể xuất hiện.
- Nếu thiếu phim chung thể loại, bổ sung bằng các phim hoạt động chưa kết thúc khác từ database. Không đủ dữ liệu thì trả ít hơn `limit` hoặc `[]`.
- Mỗi thẻ gồm `id`, `title`, `posterUrl`, `trailerUrl`, `ageRating`, `duration`, `format`, `screeningStatus`, `genres`.

## Giới hạn dữ liệu so với ảnh

Schema chưa hỗ trợ tên gốc, ảnh nền, thư viện ảnh, ngôn ngữ phụ đề, ảnh/vai diễn của diễn viên, công nghệ màn hình/âm thanh và danh sách phim yêu thích. Backend không tự tạo dữ liệu cho các phần này. Không thay đổi schema, seed, frontend hoặc module đặt vé/thanh toán trong task này.
