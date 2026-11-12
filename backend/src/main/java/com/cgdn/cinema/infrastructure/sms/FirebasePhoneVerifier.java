package com.cgdn.cinema.infrastructure.sms;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import java.util.Map;
import org.springframework.stereotype.Component;

/** Chỉ chấp nhận ID token Firebase được cấp sau khi xác minh đúng số điện thoại đăng ký. */
@Component
public class FirebasePhoneVerifier {
    private final FirebaseAuth firebaseAuth;

    public FirebasePhoneVerifier(FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    public void verify(String idToken, String localPhoneNumber) {
        FirebaseToken token;
        try {
            token = firebaseAuth.verifyIdToken(idToken);
        } catch (FirebaseAuthException | IllegalArgumentException exception) {
            throw new BusinessException(ErrorCode.INVALID_PHONE_VERIFICATION, "firebaseIdToken");
        }
        Object firebaseClaim = token.getClaims().get("firebase");
        Object provider = firebaseClaim instanceof Map<?, ?> firebase
                ? firebase.get("sign_in_provider") : null;
        // Số ở API dùng đầu 0, còn Firebase lưu E.164; chỉ token đăng nhập bằng phone cho đúng số mới hợp lệ.
        String verifiedPhone = "+84" + localPhoneNumber.substring(1);
        if (!"phone".equals(provider) || !verifiedPhone.equals(token.getClaims().get("phone_number"))) {
            throw new BusinessException(ErrorCode.INVALID_PHONE_VERIFICATION, "firebaseIdToken");
        }
    }
}
