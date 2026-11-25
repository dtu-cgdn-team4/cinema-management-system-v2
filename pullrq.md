# Refactor trang chi tiết phim thành các component riêng

## Mục tiêu

Tổ chức lại mã nguồn trang chi tiết phim để dễ đọc, bảo trì và mở rộng. Trang được chuyển ra khỏi feature `movies` sang feature `moviedetail`, đồng thời tách phần giao diện và lịch chiếu thành các component riêng.

## Thay đổi chính

- Chuyển trang và API chi tiết phim sang `frontend/src/features/moviedetail/`.
- Cập nhật route `/phim/:movieId` trong `AppRoutes.jsx` để dùng đường dẫn mới.
- Tách trang thành các component: `HeroSection`, `InfoSection`, `TrailerSection`, `RelatedMovies`, `TrailerModal`, `GalleryModal` và `ShowtimesSection`.
- Chia phần lịch chiếu thành các component chọn ngày, chọn rạp, danh sách suất chiếu và tóm tắt vé.
- Đưa các hàm định dạng dữ liệu và xử lý gallery sang thư mục `utils`.
- Giữ nguyên luồng xem trailer, xem ảnh, chọn suất chiếu và chuyển tiếp sang chọn ghế.
- Khôi phục dấu tiếng Việt trong các nhãn giao diện lịch chiếu.

## Kiểm tra

- Đã rà soát các import nội bộ và cập nhật route sang `moviedetail`.
- Chưa chạy build hoặc test.

## Ảnh hưởng

Thay đổi chỉ áp dụng cho trang chi tiết phim và route của trang này; trang danh sách phim vẫn nằm trong feature `movies`.