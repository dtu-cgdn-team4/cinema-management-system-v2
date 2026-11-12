# Kiểm tra đăng ký Firebase OTP bằng Postman, không cần frontend

## Chạy toàn bộ ca kiểm thử bằng Postman Collection Runner

Sau khi khởi động MySQL, Firebase Auth Emulator và backend theo phần **Chuẩn bị** bên dưới:

1. Trong Postman, bấm **Import** và chọn `docs/api/cinema-registration-otp.postman_collection.json`. Postman tạo một collection **Cinema API** mới có cây `Cinema API → Auth API → 01 - Firebase OTP và token → Yêu cầu OTP`; các nhóm kiểm thử còn lại cũng nằm trong `Auth API`. Collection `Cinema API` bạn đã tạo sẽ vẫn tồn tại, vì thao tác Import tạo collection riêng.
2. Mở **Cinema API** vừa import, bấm **Run**. Kiểm tra `Yêu cầu OTP` đứng thứ 1 trong danh sách chạy, đặt **Iterations = 1**, rồi bấm **Start run**. Không chạy riêng các request ở giữa khi chưa chạy bước OTP đầu tiên, vì chúng dùng biến từ các request trước.
3. Kết quả mong đợi: **42 requests, 79 assertions, 0 failed**. Request đầu tiên tự tạo số điện thoại/username/email thử nghiệm mới; không cần nhập OTP hoặc ID token bằng tay. Mỗi lần chạy thành công sẽ tạo **3 tài khoản thử** trong MySQL local.

Collection chỉ gọi `127.0.0.1:9099` và `127.0.0.1:8080`; không gửi SMS thật. Nó kiểm tra OTP sai/đúng, token giả, token số khác, token email, trường bắt buộc, các ràng buộc dữ liệu, đăng ký thành công, trùng username/email/số và trường tùy chọn. Kết quả 42/79/0 đã được xác minh bằng Newman trên môi trường local ngày 2026-11-12. Kiểm thử này không chứng minh giao SMS thật của Firebase production.

## Chuẩn bị

1. Cài Firebase CLI nếu máy chưa có (`npm install -g firebase-tools`). Trong `backend/.env`, đặt `FIREBASE_PROJECT_ID=demo-cinema`; giữ cấu hình MySQL đang dùng.
2. Mở terminal tại `backend/`, chạy `firebase emulators:start --only auth --project demo-cinema`. Emulator dùng `backend/firebase.json` và cổng `9099`.
3. Mở terminal khác tại `backend/`, đặt `$env:FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"` rồi chạy `mvn spring-boot:run`. Nếu `mvn` chưa có trong PATH trên máy này, tìm Maven đã tải bằng `$mvn = Get-ChildItem "$env:USERPROFILE\.m2\wrapper\dists" -Filter mvn.cmd -Recurse | Select-Object -First 1 -ExpandProperty FullName`, sau đó chạy `& $mvn spring-boot:run`. Firebase Admin SDK sẽ dùng emulator; không cần `GOOGLE_APPLICATION_CREDENTIALS` trong chế độ này.

Các bước dưới đây dùng số `+84900000001` **chỉ trong emulator**; tương ứng `0900000001` ở API backend. Không có SMS thật hoặc chi phí Firebase.

## 1. Yêu cầu mã OTP

Trong Postman, tạo request `POST`:

`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendVerificationCode?key=fake-api-key`

Body > raw > JSON:

```json
{"phoneNumber":"+84900000001"}
```

Lưu `sessionInfo` từ phản hồi.

## 2. Xem mã OTP do emulator tạo

Tạo request `GET`:

`http://127.0.0.1:9099/emulator/v1/projects/demo-cinema/verificationCodes`

Tìm `code` của `+84900000001`. Phiên bản Firebase Auth Emulator đã kiểm tra trả về `phoneNumber`, `sessionInfo` và `code` trong mỗi mục `verificationCodes`. Emulator tạo mã mới cho mỗi lần yêu cầu; mã này không được gửi qua SMS.

## 3. Xác nhận OTP và nhận Firebase ID token

Tạo request `POST`:

`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPhoneNumber?key=fake-api-key`

Body > raw > JSON (thay `sessionInfo` ở bước 1 và `code` ở bước 2; hoặc lấy cả hai từ mục `verificationCodes` tương ứng):

```json
{"sessionInfo":"<sessionInfo>","code":"<code>"}
```

Lưu `idToken` từ phản hồi. Nếu mã sai, Firebase từ chối và không cấp token.

## 4. Gọi API đăng ký

Tạo request `POST http://127.0.0.1:8080/api/v1/auth/register`, Body > raw > JSON:

```json
{
  "username": "otp_viewer_1",
  "fullName": "OTP Viewer",
  "email": "otp.viewer.1@example.com",
  "phoneNumber": "0900000001",
  "firebaseIdToken": "<idToken>",
  "dateOfBirth": "2000-01-01",
  "gender": "MALE",
  "password": "SecurePass1"
}
```

Kết quả mong đợi: `201 Created`, `data.role = KHACH_HANG`. Không có mật khẩu hay token trong response.

## 5. Thử các lỗi bảo vệ

- Đổi `phoneNumber` thành `0900000002` nhưng giữ token cũ: `401 Unauthorized`, lỗi `firebaseIdToken`; không tạo tài khoản.
- Đổi `firebaseIdToken` thành `invalid`: `401 Unauthorized`; không tạo tài khoản.
- Bỏ `firebaseIdToken`: `400 Bad Request`, lỗi `firebaseIdToken`.
- Gửi lại đúng request đăng ký đã thành công: `409 Conflict` do số điện thoại hoặc username đã tồn tại. Muốn thử lại ca `201`, hãy dùng số khác và dữ liệu tài khoản mới; không cần xóa dữ liệu cũ.

**Giới hạn:** emulator xác minh luồng OTP và kết nối backend nhưng không chứng minh SMS thật được giao. Khi dùng Firebase Console với số điện thoại thử nghiệm, cũng không có SMS thật; cần một client Firebase Auth để hoàn tất OTP và lấy ID token. Postman gọi trực tiếp Firebase thật để gửi mã thường cần xác minh ứng dụng/reCAPTCHA, nên dùng emulator cho kiểm thử hoàn toàn qua Postman.
