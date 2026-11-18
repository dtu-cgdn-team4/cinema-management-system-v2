# Kiểm thử API hồ sơ tài khoản bằng Postman

Import `docs/api/account-profile.postman_collection.json`. Postman sẽ tạo một collection **Cinema API** riêng (nếu đã có collection cùng tên thì chọn import as copy hoặc gộp). Collection gồm các nhóm kiểm thử:

```text
Cinema API
└── Auth API
    ├── 05 - Xem thông tin tài khoản
    │   ├── 01 - Đăng nhập lấy Bearer token
    │   ├── 02 - Xem đầy đủ hồ sơ của tôi
    │   ├── 03 - Không có token trả 401
    │   ├── 04 - Token sai trả 401
    │   ├── 05 - JWT bị sửa chữ ký trả 401
    │   ├── 06 - Token khác tài khoản thứ nhất
    │   └── 07 - JWT thứ hai chỉ xem được hồ sơ thứ hai
    ├── 06 - Cập nhật thông tin tài khoản
        ├── 01 - Đăng nhập lấy Bearer token
        ├── 02 - Cập nhật một phần (họ tên)
        ├── 03 - Cập nhật đầy đủ các trường hợp lệ
        ├── 04 - Xóa các trường tùy chọn bằng null
        ├── 05 - Họ tên rỗng hoặc chỉ có khoảng trắng trả 400
        ├── 06 - Họ tên null trả 400
        ├── 07 - Email null trả lỗi validation 400
        ├── 08 - SĐT null trả lỗi validation 400
        ├── 09 - Gửi trường chỉ đọc hoặc trường lạ bị từ chối 400
        ├── 10 - Dữ liệu không hợp lệ trả 400
        ├── 11 - Không có token trả 401
        ├── 12 - Token khác tài khoản thứ nhất
        └── 13 - JWT thứ hai không bị ảnh hưởng bởi cập nhật của tài khoản 1
    ├── 07 - Đổi mật khẩu tài khoản
    │   ├── 01 - Đăng nhập lấy Bearer token
    │   ├── 02–11 - Các trường hợp token, current password, policy, confirm và userId
    │   ├── 12 - Đổi mật khẩu thành công
    │   └── 13 - Đăng nhập bằng mật khẩu mới
    ├── 08 - Tài khoản Google chưa có mật khẩu (tùy chọn)
    │   └── 01 - Không tự thiết lập mật khẩu lần đầu
    └── 09 - Cập nhật thông tin tài khoản (SĐT - email)
        ├── 01–04 - Đăng nhập và lưu hồ sơ hai tài khoản thử
        ├── 05–08 - Cập nhật cả hai, từng trường và gửi lại giá trị của mình
        ├── 09–16 - Định dạng, null, trùng, userId và xác thực
        └── 17–18 - Kiểm tra hồ sơ sau cùng và tài khoản thứ hai
```

---

## Chuẩn bị và cấu hình biến

1. Khởi động MySQL local và backend local trên `http://127.0.0.1:8080`.
2. Mở collection **Cinema API** trong Postman, chuyển sang tab **Variables**:
   - `baseUrl`: `http://127.0.0.1:8080` (hoặc cổng backend bạn đang chạy).
   - `username`: điền tên đăng nhập của tài khoản thử thứ nhất (ví dụ: `khachhang01`).
   - `password`: điền mật khẩu của tài khoản thử thứ nhất (ví dụ: `Secret@123`).
   - `newPassword`: mật khẩu mới hợp lệ (mặc định `NewPass456`). Request đổi mật khẩu thành công sẽ cập nhật biến `password` để xác minh đăng nhập và dùng cho lần chạy tiếp theo.
   - `testEmail`, `testPhoneNumber`: dùng riêng cho folder 09. Điền email và số điện thoại hợp lệ, chưa thuộc tài khoản nào và khác giá trị hiện tại của tài khoản thử. Folder sẽ cập nhật chúng rồi đưa tài khoản về giá trị gốc.
   - Chỉ chạy folder đổi mật khẩu với tài khoản local/test; request thành công sẽ đổi mật khẩu thật của tài khoản.
   - *(Tùy chọn)* `otherUsername` & `otherPassword`: điền thông tin tài khoản thử thứ hai để kiểm tra tính độc lập giữa các tài khoản (ví dụ: `khachhang02`). Nếu bỏ trống, Postman Runner sẽ tự động bỏ qua các request kiểm tra tài khoản thứ hai (request 06–07 của mục 05 và request 12–13 của mục 06).

---

## Hướng dẫn chạy kiểm thử bằng Postman Runner

### 1. Chạy thư mục `05 - Xem thông tin tài khoản` (GET `/api/v1/account/me`)

1. Chuột phải vào thư mục **05 - Xem thông tin tài khoản** → Chọn **Run folder**.
2. Thiết lập: **Iterations = 1**.
3. Bấm **Run Cinema API**.
4. **Kết quả mong đợi:**
   - Nếu chỉ có 1 tài khoản: **5/5 requests Passed** (request 06, 07 tự động skip).
   - Nếu có cả 2 tài khoản: **7/7 requests Passed, 0 failed**.

---

### 2. Chạy thư mục `06 - Cập nhật thông tin tài khoản` (PATCH `/api/v1/account/me`)

1. Chuột phải vào thư mục **06 - Cập nhật thông tin tài khoản** → Chọn **Run folder**.
2. Thiết lập: **Iterations = 1**.
3. Bấm **Run Cinema API**.
4. **Kết quả mong đợi:**
   - Nếu chỉ có 1 tài khoản: **11/11 requests Passed** (request 12, 13 tự động skip).
   - Nếu có cả 2 tài khoản: **13/13 requests Passed, 0 failed**.

### Chi tiết các ca kiểm thử trong thư mục 06:

| Thứ tự | Tên Request | Method | Mục đích kiểm tra | Kết quả mong đợi |
|---|---|---|---|---|
| `01` | Đăng nhập lấy Bearer token | POST | Đăng nhập tài khoản 1, lưu `accessToken` vào biến collection | 200 OK |
| `02` | Cập nhật một phần (họ tên) | PATCH | Gửi `{"fullName": "..."}`, họ tên đổi, các trường khác và `joinedAt` giữ nguyên | 200 OK |
| `03` | Cập nhật đầy đủ các trường hợp lệ | PATCH | Gửi cả 5 trường (`fullName`, `dateOfBirth`, `gender`, `citizenId`, `address`) | 200 OK |
| `04` | Xóa các trường tùy chọn bằng null | PATCH | Gửi 4 trường tùy chọn là `null`, xác nhận CSDL cập nhật thành null | 200 OK |
| `05` | Họ tên rỗng hoặc chỉ có khoảng trắng | PATCH | Gửi `{"fullName": "   "}` | 400 Bad Request |
| `06` | Họ tên null | PATCH | Gửi `{"fullName": null}` | 400 Bad Request |
| `07` | Email null | PATCH | Gửi `{"email": null}` bị từ chối vì email bắt buộc khi cập nhật | 400 Bad Request (`VALIDATION_ERROR`, `errors.email`) |
| `08` | SĐT null | PATCH | Gửi `{"phoneNumber": null}` bị từ chối theo định dạng cập nhật | 400 Bad Request (`VALIDATION_ERROR`, `errors.phoneNumber`) |
| `09` | Gửi trường lạ hoặc chỉ đọc | PATCH | Gửi `{"role": "ADMIN", "userId": 1, ...}` bị từ chối | 400 Bad Request (`INVALID_REQUEST`) |
| `10` | Dữ liệu không hợp lệ | PATCH | Gửi `{"gender": "UNKNOWN"}` hoặc sai định dạng ngày sinh, CCCD | 400 Bad Request |
| `11` | Không có token | PATCH | Không truyền Bearer token | 401 Unauthorized (`UNAUTHORIZED`) |
| `12` | Token khác tài khoản thứ nhất | POST | Đăng nhập tài khoản 2 lấy `otherAccessToken` | 200 OK |
| `13` | JWT thứ hai không bị ảnh hưởng | GET | Kiểm tra hồ sơ tài khoản 2 không bị thay đổi bởi các request PATCH trước đó | 200 OK |

---

### 3. Chạy thư mục `07 - Đổi mật khẩu tài khoản` (PUT `/api/v1/account/me/password`)

Chạy tuần tự với **Iterations = 1**. Folder có 13 request; các ca lỗi chạy trước ca thành công để xác minh chúng không đổi mật khẩu.

| Thứ tự | Tên Request | Mục đích kiểm tra | Kết quả mong đợi |
|---|---|---|---|
| `01` | Đăng nhập lấy Bearer token | Lưu JWT vào `accessToken` | 200 OK |
| `02` | Không có token | Từ chối request chưa xác thực | 401 `UNAUTHORIZED` |
| `03` | Token sai | Từ chối Bearer token không hợp lệ | 401 `UNAUTHORIZED` |
| `04` | Mật khẩu hiện tại sai | Từ chối khi current password sai | 400 `CURRENT_PASSWORD_INVALID` |
| `05–09` | Mật khẩu mới không hợp lệ | Kiểm tra dưới 8 ký tự, thiếu hoa/thường/số và quá 72 byte UTF-8 | 400 `VALIDATION_ERROR` |
| `10` | Confirm không khớp | Kiểm tra xác nhận mật khẩu chính xác | 400 `VALIDATION_ERROR` |
| `11` | Có `userId` trong body | Chặn client chọn tài khoản khác | 400 `INVALID_REQUEST` |
| `12` | Đổi mật khẩu thành công | Kiểm tra response không lộ password/hash | 200 OK |
| `13` | Đăng nhập bằng mật khẩu mới | Xác nhận mật khẩu mới có hiệu lực | 200 OK |

Biến collection `password` được cập nhật sau khi request 12 thành công. Không chạy folder này trên production hoặc tài khoản dùng thật.

### 4. Kiểm tra Google account chưa có password (tùy chọn)

Điền `googleAccessToken` bằng JWT backend của tài khoản Google có `password = null`, rồi chạy `08 - Tài khoản Google chưa có mật khẩu (tùy chọn)`. Nếu token trống, Postman bỏ qua request trước khi gửi nên Runner hiển thị **0 tests** (không phải Passed hay Failed); đó là trạng thái chưa kiểm tra. Khi có token hợp lệ, request được gửi và kết quả mong đợi là HTTP 400 `GOOGLE_PASSWORD_NOT_SET`; API không thiết lập mật khẩu lần đầu. Nếu request bị skip, Postman có thể hiển thị URL chưa được resolve vì request không được gửi.

### 5. Chạy thư mục `09 - Cập nhật thông tin tài khoản (SĐT - email)`

Điền `username`, `password`, `testEmail`, `testPhoneNumber`, rồi chạy **Run folder** với **Iterations = 1** trên tài khoản thử có sẵn email và số điện thoại. Có thể điền thêm `otherUsername` và `otherPassword` của tài khoản thử thứ hai để kiểm tra lỗi trùng và tài khoản khác không bị sửa; nếu không có, các request 03, 04, 13, 14 và 18 được bỏ qua. Folder có 18 request, trong đó các ca thành công lần lượt cập nhật cả hai trường, chỉ email, chỉ số điện thoại và gửi lại giá trị của chính tài khoản. Request 07 đưa hai trường về giá trị ban đầu; request 17 xác minh lại. Các ca lỗi kiểm tra HTTP 400/409/401 và nội dung lỗi theo trường. Không có bước OTP hoặc xác minh số điện thoại.

Chỉ chạy trên tài khoản thử. Nếu dừng Runner trước request 07, email hoặc số điện thoại thử có thể còn lưu trên tài khoản; dùng request PATCH với các giá trị ban đầu để khôi phục.

Nếu request 01 trả `401`, kiểm tra `username`/`password` của **tài khoản thứ nhất** trong Collection Variables; `otherUsername`/`otherPassword` đăng nhập được không thay thế cho tài khoản thứ nhất. Mật khẩu có thể đã đổi khi chạy folder 07. Folder 09 sẽ dừng sau lỗi đăng nhập này. Nếu request 05 báo `Request could not be sent`, mở **Console log** và kiểm tra `testEmail`/`testPhoneNumber`: cả hai phải hợp lệ, khác giá trị hiện tại và chưa thuộc tài khoản khác.
