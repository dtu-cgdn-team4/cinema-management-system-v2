# Cinema Management System (Hệ Thống Quản Lý Rạp Chiếu Phim)

Đồ án thực tập - Đại học Duy Tân (DTU) kết hợp CodeGym Đà Nẵng (CGDN)
Mentor hướng dẫn: Trương Tấn Hải
Nhóm sinh viên thực hiện (Team 4): Nguyễn Minh Nguyên (NguyenNM), Nguyễn Vinh Hà (HaNV), Nguyễn Thế Huy (HuyNT), Trương Tấn Quang Vũ (VuTTQ), Dũ Ngọc Minh Tân (TamDN), Trần Văn Long (LongTV)

---

## Mục lục

1. Giới thiệu dự án (Introduction)
2. Tài nguyên và Liên kết cốt lõi
3. Công nghệ sử dụng (Technologies Used)
4. Danh sách tính năng chính (List of Features)
5. Sơ đồ cấu trúc thư mục Monorepo (Project Structure)
6. Hướng dẫn cài đặt (Installation)
7. Hướng dẫn khởi chạy và sử dụng (Usage)
8. Quy trình Git Flow

---

## 1. Giới thiệu dự án (Introduction)

Hệ thống Quản lý rạp chiếu phim (Cinema Management System) là nền tảng chuyển đổi số hỗ trợ đặt vé xem phim trực tuyến cho khách hàng và quản trị vận hành toàn diện cho cụm rạp chiếu phim hiện đại.

Dự án được xây dựng nhằm giải quyết các bài toán thực tế trong vận hành rạp chiếu phim:

- Giảm thiểu tình trạng ùn tắc tại quầy vé truyền thống nhờ hệ thống giữ chỗ và đặt vé trực tuyến theo thời gian thực.
- Hỗ trợ khách hàng dễ dàng tra cứu danh sách phim, xem trailer giới thiệu, lựa chọn suất chiếu và vị trí ghế ngồi trực quan (ghế thường, ghế VIP, ghế đôi).
- Tích hợp cổng thanh toán trực tuyến an toàn qua PayPal Sandbox và xuất vé điện tử chứa mã QR để nhân viên soát vé tự động, nhanh chóng, tiết kiệm chi phí in ấn.
- Cung cấp phân hệ quản trị trực quan giúp ban quản lý rạp dễ dàng điều phối phòng chiếu, sắp xếp lịch chiếu linh hoạt, quản lý danh mục phim và theo dõi báo cáo doanh thu minh bạch.

---

## 2. Tài nguyên và Liên kết cốt lõi

- Thư mục Google Drive dự án của nhóm
  - Tài liệu đặc tả yêu cầu: Quan ly rap chieu phim_SRS_v1.1_SE03.docx (SRS phiên bản 1.1)
  - Kế hoạch triển khai dự án: [CGDN]_Project_Plan.xlsx
- Bảng Trello quản lý tiến độ: https://trello.com/b/zNGT0IjN/dtu-projectteam-4-qu%E1%BA%A3n-ly-r%E1%BA%A1p-chi%E1%BA%BFu-phim
- Kho mã nguồn GitHub: https://github.com/dtu-cgdn-team4/cinema-management-system

---

## 3. Công nghệ sử dụng (Technologies Used)

Hệ thống áp dụng bộ công nghệ hiện đại, cân bằng giữa hiệu năng, độ ổn định và tính khả thi cho nhóm:

Backend:

- Ngôn ngữ và Nền tảng: Java 17 (LTS), Spring Boot 3.x
- Công cụ quản lý gói và build: Apache Maven 3.8+
- Bảo mật và Xác thực: Spring Security 6, JSON Web Token (JWT), Mã hóa mật khẩu một chiều BCrypt, Hỗ trợ Google OAuth2
- Tầng dữ liệu và ORM: Spring Data JPA (Hibernate)
- Xử lý mã QR soát vé: Thư viện ZXing (Zebra Crossing)
- Tài liệu hóa API tự động: SpringDoc OpenAPI 3 (Swagger UI)

Frontend:

- Ngôn ngữ và Nền tảng: ReactJS 18+, JavaScript (ES6+)
- Công cụ build và phát triển: Vite (tối ưu tốc độ tải và đóng gói mã nguồn)
- Giao diện Khách hàng đặt vé: Tailwind CSS (tùy biến giao diện hiện đại, tương thích đa thiết bị)
- Giao diện Quản trị Admin: Ant Design (hệ thống thành phần Bảng dữ liệu, Biểu mẫu, Hộp thoại và Lịch chuyên sâu)
- Giao tiếp dữ liệu API: Axios kèm bộ lọc Interceptor tự động đính kèm Token xác thực
- Định tuyến ứng dụng: React Router phiên bản 6

Cơ sở dữ liệu (Database):

- Hệ quản trị cơ sở dữ liệu: MySQL 8.0+
- Quy ước Xóa mềm (Soft Delete): Tất cả các bảng nghiệp vụ chính đều sử dụng cột trang_thai (1: Đang hoạt động / Active, 2: Đã xóa mềm / Deleted). Tuyệt đối không dùng lệnh DELETE vật lý để xóa dữ liệu.

Dịch vụ bên thứ ba (Third-party Services):

- Lưu trữ hình ảnh: Cloudinary API (lưu trữ poster phim, ảnh bìa, ảnh đại diện qua mạng phân phối nội dung CDN)
- Cổng thanh toán trực tuyến: PayPal Sandbox SDK (hỗ trợ thanh toán đơn hàng đặt vé online an toàn)

---

## 4. Danh sách tính năng chính (List of Features)

Phân hệ Khách hàng (Customer):

- Xem danh sách phim đang chiếu, phim sắp chiếu, chi tiết nội dung và xem trailer phim.
- Tìm kiếm, lọc phim theo thể loại, độ tuổi, định dạng chiếu (2D, 3D).
- Tra cứu lịch chiếu theo cụm rạp, phòng chiếu và khung giờ phù hợp.
- Chọn ghế ngồi trực quan trên sơ đồ ghế phòng chiếu thời gian thực (ghế đơn, ghế đôi, ghế VIP) và giữ ghế tạm thời trong lúc đặt.
- Thanh toán đơn hàng trực tuyến qua cổng PayPal Sandbox.
- Nhận vé điện tử có chứa mã QR bảo mật để sử dụng khi đến xem phim tại rạp.
- Đăng ký, đăng nhập tài khoản người dùng (hỗ trợ đăng nhập nhanh bằng Google) và xem lại lịch sử các giao dịch đặt vé.

Phân hệ Nhân viên (Employee / Staff):

- Quét mã QR trên vé điện tử của khách hàng hoặc nhập mã vé trực tiếp để kiểm tra tính hợp lệ của vé.
- Cập nhật trạng thái vé từ Chưa sử dụng sang Đã sử dụng khi khách vào phòng chiếu.

Phân hệ Quản trị viên (Admin):

- Bảng điều khiển (Dashboard) thống kê doanh thu theo mốc thời gian (ngày, tháng, năm) và theo từng bộ phim.
- Quản lý danh mục phim: thêm mới, cập nhật thông tin, xóa mềm phim, tải lên poster phim qua Cloudinary.
- Quản lý danh sách phòng chiếu và cấu hình sơ đồ ghế ngồi cho từng phòng.
- Quản lý lịch chiếu và suất chiếu, kiểm soát tránh trùng lịch chiếu giữa các phòng.
- Quản lý tài khoản người dùng, phân quyền truy cập hệ thống (Khách hàng, Nhân viên, Quản trị viên).

---

## 5. Sơ đồ cấu trúc thư mục Monorepo (Project Structure)

Dự án được cấu trúc theo mô hình Monorepo phân tách rõ ràng giữa Backend, Frontend và Tài liệu thiết kế:

```text
cinema-management-system/
├── .github/                                  # Cấu hình GitHub, mẫu báo lỗi và quy trình CI/CD
│   ├── ISSUE_TEMPLATE/                       # Mẫu tạo task và báo cáo lỗi chuẩn
│   ├── PULL_REQUEST_TEMPLATE.md              # Mẫu checklist kiểm tra bắt buộc khi mở PR
│   └── workflows/                            # File tự động hóa build và test mã nguồn
├── backend/                                  # Mã nguồn Backend viết bằng Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/cgdn/cinema/
│   │   │   │   ├── CinemaManagementApplication.java  # File khởi chạy chính của ứng dụng
│   │   │   │   ├── common/                   # Thành phần dùng chung toàn backend
│   │   │   │   │   ├── constants/            # Hằng số hệ thống và thông điệp thông báo
│   │   │   │   │   ├── enums/                # Định nghĩa trạng thái xóa mềm, loại ghế, vai trò
│   │   │   │   │   ├── response/             # Khuôn mẫu định dạng dữ liệu API trả về
│   │   │   │   │   └── utils/                # Hàm tiện ích như sinh mã QR, xử lý ngày giờ
│   │   │   │   ├── config/                   # Cấu hình bảo mật, CORS, Cloudinary, PayPal
│   │   │   │   ├── exception/                # Xử lý bắt lỗi tập trung và mã lỗi hệ thống
│   │   │   │   ├── security/                 # Cơ chế giải mã và xác thực bằng token JWT
│   │   │   │   └── modules/                  # Chia thư mục theo từng tính năng nghiệp vụ
│   │   │   │       ├── auth/                 # Đăng ký, đăng nhập và cấp phát token
│   │   │   │       ├── user/                 # Quản lý tài khoản khách hàng và nhân viên
│   │   │   │       ├── movie/                # Quản lý thông tin và danh mục phim
│   │   │   │       ├── showroom/             # Quản lý phòng chiếu và sơ đồ ghế ngồi
│   │   │   │       ├── showtime/             # Quản lý lịch chiếu và các suất chiếu
│   │   │   │       ├── booking/              # Nghiệp vụ đặt vé và giữ ghế tạm thời
│   │   │   │       ├── payment/              # Xử lý giao dịch thanh toán qua PayPal
│   │   │   │       └── ticket/               # Quản lý vé điện tử và quét mã QR soát vé
│   │   │   └── resources/
│   │   │       ├── application.yml           # File cấu hình chính của Spring Boot
│   │   │       ├── application-dev.yml       # Cấu hình môi trường phát triển local
│   │   │       └── db/migration/             # Script tạo bảng và dữ liệu mẫu MySQL
│   │   └── test/                             # Thư mục viết các bài kiểm thử tự động
│   ├── .env.example                          # File mẫu khai báo biến môi trường backend
│   ├── pom.xml                               # File khai báo thư viện phụ thuộc Maven
│   └── README.md                             # Hướng dẫn chi tiết riêng cho backend
├── frontend/                                 # Mã nguồn Frontend viết bằng ReactJS
│   ├── public/                               # Chứa ảnh tĩnh, biểu tượng và logo dự án
│   ├── src/
│   │   ├── app/                              # Khởi tạo ứng dụng và các bộ bao bọc dữ liệu
│   │   ├── assets/                           # Hình ảnh và giao diện đồ họa dùng trong mã nguồn
│   │   ├── components/                       # Các khối giao diện dùng chung toàn dự án
│   │   │   ├── common/                       # Khối dùng chung như thanh điều hướng, chân trang
│   │   │   └── ui/                           # Thành phần nhỏ như nút bấm, ô nhập, bảng dữ liệu
│   │   ├── features/                         # Chia theo từng màn hình và tính năng người dùng
│   │   │   ├── auth/                         # Màn hình đăng nhập, đăng ký và quên mật khẩu
│   │   │   ├── movies/                       # Danh sách phim, chi tiết phim và xem trailer
│   │   │   ├── booking/                      # Chọn suất chiếu, sơ đồ chọn ghế và combo bắp nước
│   │   │   ├── payment/                      # Màn hình thực hiện và thông báo kết quả thanh toán
│   │   │   ├── tickets/                      # Lịch sử đặt vé và màn hình hiển thị mã QR
│   │   │   └── admin/                        # Toàn bộ màn hình quản trị dành cho ban quản lý
│   │   ├── routes/                           # Cấu hình điều hướng và phân quyền đường dẫn
│   │   ├── services/                         # Cấu hình gọi API và tự động gửi kèm token
│   │   ├── hooks/                            # Các hook logic tái sử dụng nhiều nơi
│   │   ├── utils/                            # Hàm xử lý định dạng tiền tệ và thời gian
│   │   └── styles/                           # Cấu hình màu sắc, kiểu chữ và Tailwind CSS
│   ├── .env.example                          # File mẫu khai báo biến môi trường frontend
│   ├── package.json                          # Khai báo các thư viện phụ thuộc npm
│   ├── vite.config.js                        # Cấu hình công cụ đóng gói và chạy Vite
│   └── README.md                             # Hướng dẫn chi tiết riêng cho frontend
├── docs/                                     # Thư mục lưu trữ tài liệu của cả nhóm
│   ├── database/                             # Sơ đồ quan hệ thực thể ERD và bản vẽ thiết kế
│   ├── architecture/                         # Sơ đồ kiến trúc hệ thống và luồng dữ liệu
│   └── meeting-notes/                        # Ghi chú các buổi họp nhóm và họp cùng Mentor
├── .editorconfig                             # Thống nhất định dạng khoảng trắng giữa các máy
├── .gitignore                                # Chặn không đẩy các file rác và file mật lên Git
└── README.md                                 # Bản hướng dẫn tổng quan toàn bộ dự án
```

---

## 6. Hướng dẫn cài đặt (Installation)

Yêu cầu tiên quyết trên máy phát triển:

- Bộ công cụ Java Development Kit (JDK): phiên bản 17 trở lên
- Apache Maven: phiên bản 3.8 trở lên
- Node.js: phiên bản 18 trở lên và npm phiên bản 9 trở lên
- Hệ quản trị MySQL Server: phiên bản 8.0 trở lên
- Git Client

Các bước cài đặt chi tiết:

Bước 1: Tải mã nguồn dự án về máy tính:
git clone https://github.com/dtu-cgdn-team4/cinema-management-system.git
cd cinema-management-system

Bước 2: Khởi tạo cơ sở dữ liệu MySQL:
Mở MySQL Workbench hoặc Terminal và thực thi câu lệnh:
CREATE DATABASE cinema_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

Bước 3: Cấu hình môi trường cho Backend:

- Di chuyển vào thư mục backend: cd backend
- Tạo file cấu hình từ file mẫu: copy .env.example .env (trên Windows) hoặc cp .env.example .env (trên Linux hoặc macOS)
- Mở file .env và điền các thông tin kết nối MySQL, khóa bí mật JWT, tài khoản Cloudinary và tài khoản thử nghiệm PayPal Sandbox của bạn.

Bước 4: Cài đặt thư viện phụ thuộc cho Frontend:

- Di chuyển vào thư mục frontend: cd ../frontend
- Tạo file cấu hình từ file mẫu: copy .env.example .env (trên Windows) hoặc cp .env.example .env (trên Linux hoặc macOS)
- Cài đặt toàn bộ thư viện thông qua lệnh npm:
  npm install

---

## 7. Hướng dẫn khởi chạy và sử dụng (Usage)

Khởi chạy ứng dụng Backend:

1. Di chuyển vào thư mục backend: cd backend
2. Chạy ứng dụng Spring Boot bằng lệnh Maven:
   mvn spring-boot:run
3. Ứng dụng Backend sẽ hoạt động tại cổng mặc định: http://localhost:8080
4. Truy cập giao diện tài liệu Swagger UI để kiểm thử và theo dõi các điểm cuối API:
   http://localhost:8080/swagger-ui/index.html

Khởi chạy ứng dụng Frontend:

1. Di chuyển vào thư mục frontend: cd frontend
2. Khởi động máy chủ phát triển Vite:
   npm run dev
3. Mở trình duyệt web và truy cập theo đường dẫn: http://localhost:5173

---

## 8. Quy trình Git Flow

Hệ thống phân nhánh (Branching Strategy):

- main: Nhánh chính thức chỉ chứa mã nguồn đã kiểm thử ổn định, dùng để demo và nghiệm thu sản phẩm.
- develop: Nhánh tích hợp trung gian dùng cho toàn bộ hoạt động phát triển tính năng của nhóm.
- feature/#<task-id></task>_<tên-tính-năng>: Nhánh phát triển tính năng cá nhân, bắt buộc phải tách ra từ nhánh develop. Ví dụ: feature/#1_setup-spring-boot

Quy tắc ghi nhận thay đổi (Conventional Commits):
Cú pháp: <type></type>: <mô tả ngắn gọn về nội dung thay đổi>

- feat: Thêm tính năng mới
- fix: Sửa lỗi mã nguồn
- refactor: Tối ưu cấu trúc mã nguồn, không làm thay đổi hành vi logic
- docs: Cập nhật tài liệu kỹ thuật hoặc hướng dẫn
- test: Bổ sung hoặc chỉnh sửa các ca kiểm thử
- chore: Thay đổi cấu hình build, công cụ hoặc thư viện phụ thuộc

Quy trình tạo Yêu cầu gộp mã nguồn (Pull Request):

- Tuyệt đối không commit hoặc đẩy mã nguồn trực tiếp vào nhánh main và nhánh develop.
- Mở Pull Request từ nhánh tính năng (feature) hướng về nhánh develop kèm theo thông tin mã thẻ task, mô tả giải pháp và hình ảnh minh chứng kiểm thử local.
- Bắt buộc phải có ít nhất 1 thành viên trong nhóm xem xét (review) và chấp thuận (approve) trước khi gộp mã nguồn.
- Ưu tiên sử dụng phương thức Squash and merge để giữ cho lịch sử commit luôn sạch và dễ theo dõi.


---
