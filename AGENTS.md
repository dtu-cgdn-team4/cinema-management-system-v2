# AGENTS.md — QUY TẮC LÀM VIỆC CỦA AI AGENT

## 1. Thông tin dự án

- Dự án: Cinema Management System V2
- Backend: Java Spring Boot
- Database: MySQL
- Frontend: React
- Quy trình quản lý mã nguồn: Git Flow

### Task hiện tại

- Mã task: 6.4.1.2
- Tên task: Backend — Quản lý vé đã đặt của thành viên
- Tài liệu tham chiếu: SRS mục 6.4.1.2
- Phạm vi: Chỉ phát triển Backend phục vụ chức năng xem danh sách và chi tiết vé đã mua của tài khoản đang đăng nhập.

**NGUYÊN TẮC QUAN TRỌNG NHẤT:**

AI Agent được phép ĐỌC toàn bộ source code của dự án để tìm hiểu cấu trúc, quan hệ database, nghiệp vụ và tái sử dụng các chức năng hiện có.

Tuy nhiên, AI Agent CHỈ ĐƯỢC PHÉP CHỈNH SỬA những file trực tiếp phục vụ task hiện tại.

Mọi thay đổi ngoài phạm vi đều phải được người dùng chấp thuận trước khi thực hiện.

---

## 2. Quy tắc đọc và chỉnh sửa source code

### 2.1. Quyền đọc

Agent được phép:

- Đọc toàn bộ source code Backend và Frontend.
- Đọc Entity, Repository, Service, Controller.
- Đọc cấu hình JWT và Spring Security.
- Đọc database schema và Flyway migration.
- Đọc các API hiện có.
- Đọc tài liệu SRS, Q&A và Git Flow.
- Phân tích code của các thành viên khác để hiểu nghiệp vụ.
- Tìm kiếm và kiểm tra quan hệ giữa các module.

Việc đọc code chỉ nhằm hỗ trợ thực hiện task hiện tại.

### 2.2. Quyền chỉnh sửa

Agent chỉ được phép:

- Tạo các file mới trực tiếp phục vụ Backend quản lý vé thành viên.
- Chỉnh sửa file thuộc module của task hiện tại.
- Bổ sung Repository, Service, Controller, DTO và Test cần thiết.
- Tái sử dụng Entity, Repository, Service và các thành phần đã có mà không sửa chúng nếu không cần thiết.
- Sửa lỗi do chính phần code mới của task gây ra.

Không tự ý mở rộng chức năng ngoài yêu cầu.

### 2.3. Các hành động bị nghiêm cấm

Agent KHÔNG ĐƯỢC:

1. Tự ý chỉnh sửa code của thành viên khác.
2. Xóa hoặc đổi tên file không thuộc task.
3. Refactor các module không liên quan.
4. Format hàng loạt source code.
5. Tự ý thay đổi cấu trúc thư mục dự án.
6. Thay đổi API đang được các module khác sử dụng.
7. Thay đổi chữ ký phương thức của các Service dùng chung.
8. Tự ý thay đổi Entity hoặc quan hệ database.
9. Xóa hoặc sửa các Flyway migration đã tồn tại.
10. Tự ý chỉnh sửa dữ liệu mẫu của module khác.
11. Thêm dependency không cần thiết.
12. Xóa test case hiện có.
13. Thay đổi cấu hình bảo mật để API chạy được.
14. Tắt JWT, bỏ xác thực hoặc nới lỏng phân quyền.
15. Tự ý thay đổi logic đặt vé, thanh toán hoặc quản lý phim.
16. Ghi đè thay đổi chưa commit của người dùng.
17. Thực hiện các lệnh Git có nguy cơ làm mất dữ liệu.

Tuyệt đối không dùng các lệnh sau nếu chưa được cho phép:

- `git reset --hard`
- `git clean -fd`
- `git push --force`
- `git restore .`
- `git checkout -- .`

Không tự động giải quyết conflict bằng cách ghi đè hoặc xóa code của người khác.

---

## 3. Các khu vực cần được bảo vệ

### 3.1. Frontend

Thư mục:

`frontend/`

- Chỉ được đọc để tìm hiểu API contract.
- Không tạo, sửa hoặc xóa bất kỳ file nào.
- Không chỉnh sửa giao diện.
- Không thay đổi mock data.
- Không chỉnh sửa routing hoặc component.

### 3.2. Các module Backend ngoài task

Không tự ý chỉnh sửa các chức năng:

- Đăng nhập, đăng ký và xác thực.
- JWT và Google Authentication.
- Quản lý phim và chi tiết phim.
- Danh sách phim.
- Lịch chiếu.
- Đặt vé và chọn ghế.
- Thanh toán.
- Quản lý rạp và phòng chiếu.
- Quản lý nhân viên.
- Quản lý khuyến mãi.
- Quản trị hệ thống.

Chỉ được đọc và tái sử dụng code của các module trên.

### 3.3. Các file dùng chung

Đặc biệt hạn chế chỉnh sửa:

- `SecurityConfig.java`
- `ApiResponse.java`
- `GlobalExceptionHandler.java`
- `application.yml`
- `pom.xml`
- Các file JWT.
- Các Entity dùng chung.
- Các Flyway migration hiện có.
- Các file cấu hình môi trường.

Nếu bắt buộc phải chỉnh sửa:

1. Giải thích lý do.
2. Chỉ rõ file và phần cần thay đổi.
3. Phân tích ảnh hưởng đến các module khác.
4. Đề xuất phương án ít ảnh hưởng nhất.
5. Chờ người dùng xác nhận.

Chưa được xác nhận thì không chỉnh sửa.

---

## 4. Phạm vi nghiệp vụ được triển khai

### 4.1. Danh sách vé đã đặt

Xây dựng Backend cho phép thành viên:

- Xem danh sách vé đã mua thành công.
- Xem mã đặt vé.
- Xem tên phim và poster.
- Xem ngày đặt.
- Xem ngày giờ chiếu.
- Xem phòng chiếu.
- Xem số ghế đã chọn.
- Xem tổng tiền.
- Xem trạng thái vé.

Danh sách chỉ được trả về cho tài khoản đang đăng nhập.

### 4.2. Xem chi tiết vé

Cung cấp thông tin:

- Mã đặt vé hoặc mã vé tương ứng.
- Tên phim.
- Poster phim.
- Rạp chiếu.
- Phòng chiếu.
- Ngày giờ chiếu.
- Danh sách ghế.
- Tổng tiền.
- Trạng thái vé.
- Dữ liệu mã QR của vé.

Phải xác định rõ quan hệ giữa mã đặt vé và mã vé trong database trước khi triển khai QR.

### 4.3. Bảo mật

- Tái sử dụng JWT hiện có.
- Xác định tài khoản từ thông tin xác thực.
- Không tin tưởng userId do client tự truyền.
- Không cho phép thành viên xem vé của tài khoản khác.
- Không trả về dữ liệu nhạy cảm không cần thiết.
- Không thay đổi cơ chế bảo mật chung.

### 4.4. Chức năng không thuộc phạm vi

KHÔNG triển khai:

- Hủy vé.
- Hoàn tiền.
- Thanh toán vé.
- Đặt vé mới.
- Chọn ghế.
- Quét QR tại rạp.
- Thay đổi trạng thái nhận vé.
- Chỉnh sửa thông tin thành viên.
- Quản lý điểm tích lũy.
- Backend chi tiết phim.
- Frontend.

---

## 5. Quy trình làm việc bắt buộc

### Bước 1 — Phân tích

Trước khi viết code:

1. Đọc cấu trúc dự án.
2. Kiểm tra các API có sẵn.
3. Kiểm tra database và Entity liên quan.
4. Xác định những thành phần có thể tái sử dụng.
5. Liệt kê file cần tạo mới.
6. Liệt kê file cần chỉnh sửa.
7. Đánh giá nguy cơ conflict.

Không được chỉnh sửa code trong bước này.

### Bước 2 — Lập kế hoạch

Chia task thành các phần nhỏ:

1. Repository và truy vấn dữ liệu.
2. API danh sách vé.
3. API chi tiết vé.
4. Dữ liệu QR.
5. Unit Test và Integration Test.
6. Kiểm tra và chuẩn bị Pull Request.

Mỗi phần phải có mục tiêu và phạm vi file rõ ràng.

### Bước 3 — Triển khai

Khi được yêu cầu triển khai một phần:

- Chỉ làm đúng phần được giao.
- Không tự động thực hiện phần tiếp theo.
- Ưu tiên tạo file mới thay vì sửa file dùng chung.
- Không viết lại logic đã tồn tại.
- Không thêm chức năng ngoài yêu cầu.
- Không tự ý sửa lỗi không liên quan.

Nếu phát hiện vấn đề ngoài phạm vi, chỉ báo cáo.

### Bước 4 — Kiểm tra

Sau mỗi phần:

- Kiểm tra các file đã thay đổi.
- Kiểm tra lỗi biên dịch.
- Kiểm tra logic nghiệp vụ.
- Kiểm tra ảnh hưởng đến module khác.
- Chạy các test phù hợp.
- Kiểm tra Git diff.

Không được tự sửa file ngoài phạm vi chỉ để làm toàn bộ dự án build thành công.

### Bước 5 — Báo cáo

Sau mỗi phần công việc, báo cáo:

1. Đã thực hiện những gì.
2. Những file đã tạo mới.
3. Những file đã chỉnh sửa.
4. Lý do chỉnh sửa.
5. Kết quả kiểm thử.
6. Vấn đề còn tồn tại.
7. Có ảnh hưởng module khác hay không.

Nếu chưa hoàn thành, phải nói rõ.

---

## 6. Quy tắc Git và Pull Request

Tuân thủ Git Flow của team.

### Branch

- Không commit trực tiếp lên `main`.
- Không commit trực tiếp lên `develop`.
- Làm việc trên feature branch của task.
- Không tự ý chuyển branch khi đang có thay đổi chưa commit.
- Không tự ý merge nhánh khác.

### Commit

- Chia commit theo từng chức năng nhỏ.
- Mỗi commit chỉ chứa các file liên quan.
- Không dùng `git add .` hoặc `git add -A` một cách tự động.
- Ưu tiên `git add` với đường dẫn file cụ thể.
- Kiểm tra `git status` và `git diff --cached` trước commit.
- Không đưa file cá nhân, file tạm, log hoặc cấu hình nhạy cảm vào commit.
- Không commit các thay đổi có sẵn của người khác.

Quy ước:

- `feat:` Thêm chức năng.
- `fix:` Sửa lỗi.
- `test:` Bổ sung kiểm thử.
- `refactor:` Tái cấu trúc code thuộc task.
- `docs:` Cập nhật tài liệu.

### Pull Request

- PR phải hướng về `develop`.
- Chỉ chứa code thuộc task hiện tại.
- Tiêu đề và mô tả rõ ràng.
- Có bằng chứng kiểm thử.
- Ghi rõ các file đã thay đổi.
- Ghi chú các ảnh hưởng nếu có.
- Không tự merge PR.

**Agent không được tự commit, push, tạo PR hoặc merge nếu người dùng chưa yêu cầu cụ thể.**

Khi người dùng yêu cầu commit hoặc tạo PR, chỉ thực hiện đúng hành động được chỉ định.

---

## 7. Quy tắc xử lý khi gặp vấn đề

Khi gặp lỗi:

- Đầu tiên xác định lỗi có thuộc task hiện tại không.
- Nếu thuộc task, được phép sửa trong phạm vi.
- Nếu thuộc module khác, không tự ý sửa.
- Báo cáo nguyên nhân và đề xuất hướng xử lý.
- Chờ người dùng xác nhận trước khi can thiệp.

Khi gặp thiếu dữ liệu hoặc thiếu chức năng:

- Không tự tạo logic giả để thay thế.
- Không tự thay đổi cấu trúc database.
- Không tự tạo migration ngoài kế hoạch.
- Báo cáo phụ thuộc còn thiếu.

Khi gặp conflict:

- Không ghi đè code.
- Không xóa thay đổi của người khác.
- Không tự động chọn `ours` hoặc `theirs`.
- Báo cáo file conflict và vị trí liên quan.
- Chờ hướng dẫn xử lý.

---

## 8. Quy tắc giao tiếp

- Luôn trả lời bằng tiếng Việt.
- Giải thích ngắn gọn, rõ ràng.
- Không tự ý mở rộng task.
- Không tự quyết định thay người dùng đối với thay đổi có rủi ro.
- Khi chưa rõ yêu cầu, ưu tiên phân tích và báo cáo.
- Không khẳng định đã test thành công khi chưa thực sự chạy test.
- Không khẳng định đã commit hoặc push khi chưa thực hiện.
- Không che giấu lỗi hoặc thay đổi ngoài ý muốn.

---

## 9. Quy tắc kiểm thử và commit

- Mỗi task nhỏ phải đi kèm test tự động phù hợp.
- Ưu tiên JUnit, Mockito và Spring Boot Test theo cấu trúc dự án.
- Chỉ tạo hoặc chỉnh sửa test thuộc phạm vi task hiện tại.
- Không xóa hoặc sửa test của module khác.
- Sau khi hoàn thành task, chạy test liên quan.
- Nếu test thất bại, phân tích nguyên nhân trước khi sửa.
- Không tự ý sửa module khác để làm test thành công.
- Kiểm tra git status và git diff trước khi commit.
- Chỉ commit khi chức năng đã hoàn thành và test đạt.
- Nếu chưa thể chạy test, phải báo cáo rõ nguyên nhân.
- Chỉ thực hiện commit khi người dùng cho phép.
- Sau khi hoàn thành toàn bộ Backend, chạy kiểm thử
  tích hợp và regression test trước khi tạo PR.

## 10. Nguyên tắc cuối cùng

**ĐƯỢC ĐỌC TOÀN BỘ DỰ ÁN — CHỈ ĐƯỢC SỬA CODE THUỘC TASK.**

**KHÔNG TỰ Ý ĐỤNG VÀO CODE CỦA THÀNH VIÊN KHÁC.**

**KHÔNG TỰ Ý THAY ĐỔI DATABASE, SECURITY HOẶC FILE DÙNG CHUNG.**

**KHÔNG TỰ Ý COMMIT, PUSH, TẠO PR HOẶC MERGE.**

**MỌI THAY ĐỔI NGOÀI PHẠM VI PHẢI ĐƯỢC NGƯỜI DÙNG CHẤP THUẬN TRƯỚC.**

Nếu một yêu cầu mới có nguy cơ vi phạm các quy tắc trên, Agent phải báo cáo xung đột và đề nghị xác nhận rõ phạm vi trước khi thực hiện.
