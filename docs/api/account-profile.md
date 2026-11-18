# Tài liệu API Hồ sơ và tài khoản cá nhân

Hệ thống cung cấp các endpoint quản lý thông tin hồ sơ tài khoản cá nhân dưới tiền tố `/api/v1/account`. Tất cả các thao tác đều yêu cầu xác thực bằng Bearer JWT và chỉ thao tác trên tài khoản của người dùng đăng nhập hiện tại lấy từ Security Principal.

---

## 1. Xem thông tin hồ sơ cá nhân

- **Phương thức:** `GET`
- **Đường dẫn:** `/api/v1/account/me`
- **Yêu cầu xác thực:** `Bearer <token>` (Header `Authorization`)

### Phản hồi thành công (HTTP 200)

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {
    "memberCode": "TV0000128",
    "username": "nguyenvanan",
    "fullName": "Nguyễn Văn An",
    "dateOfBirth": "2002-08-15",
    "gender": "MALE",
    "email": "an@example.com",
    "phoneNumber": "0905123456",
    "citizenId": "048202001234",
    "address": "Đà Nẵng",
    "loyaltyPoints": 1250,
    "joinedAt": "2025-03-12T10:00:00"
  }
}
```

---

## 2. Cập nhật thông tin hồ sơ cá nhân

- **Phương thức:** `PATCH`
- **Đường dẫn:** `/api/v1/account/me`
- **Yêu cầu xác thực:** `Bearer <token>` (Header `Authorization`)
- **Nguyên tắc an toàn:**
  - Chỉ cập nhật tài khoản lấy từ principal trong JWT; không nhận `userId` từ query parameter hay request body.
  - Không cho phép thay đổi: `username`, `role`, `loyaltyPoints`, `joinedAt` (`createdAt`) hoặc `password`.

### 2.1. Cấu trúc Request Body

Chỉ cho phép tối đa 7 trường sau trong JSON request:

| Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc & Giới hạn |
|---|---|---|---|
| `email` | String | Không | Nếu gửi: không được `null`/rỗng; chuỗi gốc tối đa 254 ký tự và khớp `[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}` (không có khoảng trắng), sau đó trim/chuyển chữ thường; chưa thuộc tài khoản khác. |
| `phoneNumber` | String | Không | Nếu gửi: không được `null`/rỗng; chuỗi gốc khớp `0[35789][0-9]{8}` (không có khoảng trắng), sau đó trim; chưa thuộc tài khoản khác. Cập nhật hồ sơ không yêu cầu OTP và không xác nhận số đã được xác minh. |
| `fullName` | String | Không | Nếu gửi lên: không được `null`, rỗng `""` hoặc chỉ chứa khoảng trắng. Chiều dài sau khi trim từ 2 đến 150 ký tự. |
| `dateOfBirth` | String (ISO Date `YYYY-MM-DD`) | Không | Tùy chọn. Gửi `null` sẽ xóa ngày sinh trong CSDL. Nếu có giá trị, tuổi phải từ 13 đến 120 tính theo giờ ứng dụng (`Asia/Ho_Chi_Minh`). |
| `gender` | String | Không | Tùy chọn. Gửi `null` sẽ xóa giới tính trong CSDL. Nếu có giá trị, chỉ chấp nhận một trong ba giá trị: `MALE`, `FEMALE`, `OTHER`. |
| `citizenId` | String | Không | Tùy chọn. Gửi `null`, rỗng `""` hoặc khoảng trắng sẽ xóa giá trị trong CSDL. Nếu có giá trị, phải gồm đúng 9 hoặc 12 chữ số (`[0-9]{9}` hoặc `[0-9]{12}`). |
| `address` | String | Không | Tùy chọn. Gửi `null`, rỗng `""` hoặc khoảng trắng sẽ xóa giá trị trong CSDL. Nếu có giá trị, chiều dài từ 5 đến 255 ký tự. |

### 2.2. Quy tắc xử lý trường vắng mặt và trường ngoài hợp đồng

1. **Trường không gửi (vắng mặt trong JSON):** Giữ nguyên giá trị hiện có trong CSDL, không bị ghi đè.
2. **Trường tùy chọn gửi `null`:** `dateOfBirth`, `gender`, `citizenId`, `address` được xóa. `email` và `phoneNumber` gửi `null` hoặc rỗng bị từ chối HTTP 400; email là cột bắt buộc trong CSDL.
3. **Trường ngoài hợp đồng:** Bất kỳ trường nào ngoài 7 trường trên (ví dụ: `role`, `username`, `userId`, `id`, `loyaltyPoints`, v.v.), **kể cả khi gửi giá trị `null`**, đều bị từ chối với HTTP 400 Bad Request (`INVALID_REQUEST`); hệ thống không âm thầm bỏ qua.
4. Gửi lại email hoặc số điện thoại của chính tài khoản hiện tại vẫn thành công.

### 2.3. Ví dụ Request

#### Cập nhật email và số điện thoại cùng lúc
```json
{"email":"new@example.com","phoneNumber":"0391234567"}
```

#### Chỉ cập nhật email
```json
{"email":"new@example.com"}
```

#### Chỉ cập nhật số điện thoại
```json
{"phoneNumber":"0391234567"}
```

#### Cập nhật một phần (chỉ họ tên)
```json
{
  "fullName": "Trần Văn An"
}
```

#### Xóa các trường tùy chọn bằng `null`
```json
{
  "address": null,
  "citizenId": null,
  "dateOfBirth": null,
  "gender": null
}
```

#### Cập nhật đầy đủ các trường hợp lệ
```json
{
  "fullName": "Nguyễn Thị Mai",
  "dateOfBirth": "1998-05-20",
  "gender": "FEMALE",
  "citizenId": "048198009876",
  "address": "123 Nguyễn Văn Linh, Đà Nẵng"
}
```

### 2.4. Phản hồi thành công (HTTP 200)

Trả về đối tượng `AccountProfileResponse` chứa thông tin hồ sơ sau khi cập nhật:

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {
    "memberCode": "TV0000128",
    "username": "nguyenvanan",
    "fullName": "Nguyễn Thị Mai",
    "dateOfBirth": "1998-05-20",
    "gender": "FEMALE",
    "email": "new@example.com",
    "phoneNumber": "0391234567",
    "citizenId": "048198009876",
    "address": "123 Nguyễn Văn Linh, Đà Nẵng",
    "loyaltyPoints": 1250,
    "joinedAt": "2025-03-12T10:00:00"
  }
}
```

---

## 3. Đổi mật khẩu tài khoản hiện tại

- **Phương thức:** `PUT`
- **Đường dẫn:** `/api/v1/account/me/password`
- **Yêu cầu xác thực:** `Authorization: Bearer <token>`
- **Ví dụ header:** `Authorization: Bearer eyJhbGciOi...`

### Request body

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass456",
  "confirmPassword": "NewPass456"
}
```

Mật khẩu mới phải có tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và chữ số, đồng thời không vượt quá 72 byte UTF-8 (giới hạn BCrypt). `confirmPassword` phải khớp chính xác với `newPassword`. Endpoint chỉ thao tác tài khoản trong Bearer token; không chấp nhận `userId` hay trường ngoài hợp đồng.

### Phản hồi thành công (HTTP 200)

```json
{
  "code": 200,
  "message": "Đổi mật khẩu thành công"
}
```

Không trả mật khẩu hoặc password hash. Mật khẩu mới chỉ được lưu sau khi mật khẩu hiện tại hợp lệ; Google account chưa có password không được tự động thiết lập password qua endpoint này.

### Lỗi đổi mật khẩu

| HTTP Status | Mã lỗi | Trường hợp |
|---|---|---|
| `400 Bad Request` | `INVALID_REQUEST` | Thiếu/sai body hoặc có trường ngoài hợp đồng như `userId` |
| `400 Bad Request` | `VALIDATION_ERROR` | Mật khẩu mới không đạt chính sách hoặc xác nhận không khớp; response có `errors.newPassword` hoặc `errors.confirmPassword` |
| `400 Bad Request` | `CURRENT_PASSWORD_INVALID` | Mật khẩu hiện tại không đúng |
| `400 Bad Request` | `GOOGLE_PASSWORD_NOT_SET` | Tài khoản Google chưa có mật khẩu để đổi |
| `401 Unauthorized` | `UNAUTHORIZED` | Thiếu token hoặc token không hợp lệ/hết hạn |
| `404 Not Found` | `USER_NOT_FOUND` | Tài khoản trong token không còn tồn tại |

---

## 4. Danh mục mã lỗi và phản hồi lỗi

| HTTP Status | Mã lỗi (`errorCode`) | Trường hợp xảy ra | Cấu trúc phản hồi mẫu |
|---|---|---|---|
| `400 Bad Request` | `INVALID_REQUEST` | Gửi trường ngoài hợp đồng (kể cả gửi `null`), gửi trường chỉ đọc (`role`, `userId`, ...), sai cú pháp JSON hoặc thiếu body | `{"code":400,"errorCode":"INVALID_REQUEST","message":"Trường 'userId' không được phép cập nhật."}` |
| `400 Bad Request` | `VALIDATION_ERROR` | Trường hồ sơ không hợp lệ, gồm email/số điện thoại sai định dạng hoặc `null`/rỗng; mật khẩu mới yếu/xác nhận không khớp | `{"code":400,"message":"Email không đúng định dạng.","errors":{"email":"Email không đúng định dạng."}}` |
| `409 Conflict` | `EMAIL_EXISTS` | Email đã thuộc tài khoản khác | `{"code":409,"message":"Email đã tồn tại.","errors":{"email":"Email đã tồn tại."}}` |
| `409 Conflict` | `PHONE_EXISTS` | Số điện thoại đã thuộc tài khoản khác | `{"code":409,"message":"Số điện thoại đã tồn tại.","errors":{"phoneNumber":"Số điện thoại đã tồn tại."}}` |
| `400 Bad Request` | `CURRENT_PASSWORD_INVALID` | Mật khẩu hiện tại không chính xác | `{"code":400,"errorCode":"CURRENT_PASSWORD_INVALID","message":"Mật khẩu hiện tại không chính xác"}` |
| `400 Bad Request` | `GOOGLE_PASSWORD_NOT_SET` | Tài khoản Google chưa thiết lập mật khẩu | `{"code":400,"errorCode":"GOOGLE_PASSWORD_NOT_SET","message":"Tài khoản này đăng nhập bằng Google và chưa thiết lập mật khẩu"}` |
| `401 Unauthorized` | `UNAUTHORIZED` | Thiếu Header Authorization Bearer token, token sai hoặc đã hết hạn | `{"code":401,"errorCode":"UNAUTHORIZED","message":"Phiên đăng nhập không hợp lệ hoặc đã hết hạn"}` |
| `403 Forbidden` | `ACCOUNT_DISABLED` | Tài khoản đã bị ngừng hoạt động hoặc xóa mềm | `{"code":403,"errorCode":"ACCOUNT_DISABLED","message":"Tài khoản đã ngừng hoạt động"}` |
| `404 Not Found` | `USER_NOT_FOUND` | Người dùng trong token không tồn tại trong CSDL | `{"code":404,"errorCode":"USER_NOT_FOUND","message":"Không tìm thấy người dùng"}` |

---

## 5. Giới hạn hiện tại

- `username` không thể thay đổi qua API này. Thay đổi số điện thoại trong hồ sơ chỉ kiểm tra định dạng và tính duy nhất; API không đánh dấu số điện thoại đã được xác minh.
