# Tài liệu API Hồ sơ tài khoản cá nhân

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
  - Tuyệt đối không cho phép thay đổi: `username`, `email`, `phoneNumber`, `role`, `loyaltyPoints`, `joinedAt` (`createdAt`) hoặc `password`.

### 2.1. Cấu trúc Request Body

Chỉ cho phép tối đa 5 trường sau trong JSON request:

| Trường | Kiểu dữ liệu | Bắt buộc | Quy tắc & Giới hạn |
|---|---|---|---|
| `fullName` | String | Không | Nếu gửi lên: không được `null`, rỗng `""` hoặc chỉ chứa khoảng trắng. Chiều dài sau khi trim từ 2 đến 150 ký tự. |
| `dateOfBirth` | String (ISO Date `YYYY-MM-DD`) | Không | Tùy chọn. Gửi `null` sẽ xóa ngày sinh trong CSDL. Nếu có giá trị, tuổi phải từ 13 đến 120 tính theo giờ ứng dụng (`Asia/Ho_Chi_Minh`). |
| `gender` | String | Không | Tùy chọn. Gửi `null` sẽ xóa giới tính trong CSDL. Nếu có giá trị, chỉ chấp nhận một trong ba giá trị: `MALE`, `FEMALE`, `OTHER`. |
| `citizenId` | String | Không | Tùy chọn. Gửi `null`, rỗng `""` hoặc khoảng trắng sẽ xóa giá trị trong CSDL. Nếu có giá trị, phải gồm đúng 9 hoặc 12 chữ số (`[0-9]{9}` hoặc `[0-9]{12}`). |
| `address` | String | Không | Tùy chọn. Gửi `null`, rỗng `""` hoặc khoảng trắng sẽ xóa giá trị trong CSDL. Nếu có giá trị, chiều dài từ 5 đến 255 ký tự. |

### 2.2. Quy tắc xử lý trường vắng mặt và trường ngoài hợp đồng

1. **Trường không gửi (vắng mặt trong JSON):** Giữ nguyên giá trị hiện có trong CSDL, không bị ghi đè.
2. **Trường tùy chọn gửi `null`:** Xóa giá trị trong CSDL (cập nhật thành `null`).
3. **Trường ngoài hợp đồng:** Bất kỳ trường nào ngoài 5 trường trên (ví dụ: `email`, `phoneNumber`, `role`, `username`, `userId`, `id`, `loyaltyPoints`, v.v.), **kể cả khi gửi giá trị `null`** (ví dụ: `{"email": null}`), đều bị từ chối với HTTP 400 Bad Request (`ErrorCode.INVALID_REQUEST`); hệ thống không âm thầm bỏ qua.

### 2.3. Ví dụ Request

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
    "email": "an@example.com",
    "phoneNumber": "0905123456",
    "citizenId": "048198009876",
    "address": "123 Nguyễn Văn Linh, Đà Nẵng",
    "loyaltyPoints": 1250,
    "joinedAt": "2025-03-12T10:00:00"
  }
}
```

---

## 3. Danh mục mã lỗi và phản hồi lỗi

| HTTP Status | Mã lỗi (`errorCode`) | Trường hợp xảy ra | Cấu trúc phản hồi mẫu |
|---|---|---|---|
| `400 Bad Request` | `INVALID_REQUEST` | Gửi trường ngoài hợp đồng (kể cả gửi `null`), gửi trường chỉ đọc (`email`, `phoneNumber`, `role`, `userId`, ...), sai cú pháp JSON hoặc thiếu body | `{"code":400,"errorCode":"INVALID_REQUEST","message":"Trường 'email' không được phép cập nhật."}` |
| `400 Bad Request` | `VALIDATION_ERROR` | `fullName` null/rỗng/dưới 2 ký tự/quá 150 ký tự; `dateOfBirth` tuổi < 13 hoặc > 120; `gender` sai giá trị; `citizenId` không đủ 9/12 số; `address` < 5 ký tự hoặc > 255 ký tự | `{"code":400,"message":"Họ và tên không được để trống.","errors":{"fullName":"Họ và tên không được để trống."}}` |
| `401 Unauthorized` | `UNAUTHORIZED` | Thiếu Header Authorization Bearer token, token sai hoặc đã hết hạn | `{"code":401,"errorCode":"UNAUTHORIZED","message":"Phiên đăng nhập không hợp lệ hoặc đã hết hạn"}` |
| `403 Forbidden` | `ACCOUNT_DISABLED` | Tài khoản đã bị ngừng hoạt động hoặc xóa mềm | `{"code":403,"errorCode":"ACCOUNT_DISABLED","message":"Tài khoản đã ngừng hoạt động"}` |
| `404 Not Found` | `USER_NOT_FOUND` | Người dùng trong token không tồn tại trong CSDL | `{"code":404,"errorCode":"USER_NOT_FOUND","message":"Không tìm thấy người dùng"}` |

---

## 4. Giới hạn hiện tại

- API này chỉ phục vụ cập nhật thông tin cá nhân. API đổi mật khẩu chưa triển khai trong đợt này.
- Các trường định danh và liên hệ (`username`, `email`, `phoneNumber`) không thể thay đổi qua API này để bảo đảm tính toàn vẹn tài khoản và ràng buộc xác thực OTP/Google.
