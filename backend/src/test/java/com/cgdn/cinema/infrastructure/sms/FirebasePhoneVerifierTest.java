package com.cgdn.cinema.infrastructure.sms;

import com.cgdn.cinema.exception.BusinessException;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import java.util.Map;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class FirebasePhoneVerifierTest {
    private FirebaseAuth auth;
    private FirebasePhoneVerifier verifier;

    @BeforeEach
    void setUp() {
        auth = mock(FirebaseAuth.class);
        verifier = new FirebasePhoneVerifier(auth);
    }

    @Test
    void acceptsVerifiedPhoneNumber() throws Exception {
        FirebaseToken token = mock(FirebaseToken.class);
        when(auth.verifyIdToken("token")).thenReturn(token);
        when(token.getClaims()).thenReturn(Map.of(
                "phone_number", "+84901234567",
                "firebase", Map.of("sign_in_provider", "phone")));

        verifier.verify("token", "0901234567");
    }

    @Test
    void rejectsWrongPhoneAndNonPhoneSignIn() throws Exception {
        FirebaseToken token = mock(FirebaseToken.class);
        when(auth.verifyIdToken("token")).thenReturn(token);
        for (Map<String, Object> claims : List.<Map<String, Object>>of(
                Map.of("phone_number", "+84999999999", "firebase", Map.of("sign_in_provider", "phone")),
                Map.of("phone_number", "+84901234567", "firebase", Map.of("sign_in_provider", "password")))) {
            when(token.getClaims()).thenReturn(claims);
            assertThatThrownBy(() -> verifier.verify("token", "0901234567"))
                    .isInstanceOf(BusinessException.class)
                    .extracting("field").isEqualTo("firebaseIdToken");
        }
    }

    @Test
    void rejectsInvalidToken() throws Exception {
        when(auth.verifyIdToken("bad")).thenThrow(new IllegalArgumentException("invalid token"));
        assertThatThrownBy(() -> verifier.verify("bad", "0901234567"))
                .isInstanceOf(BusinessException.class)
                .extracting("field").isEqualTo("firebaseIdToken");
    }
}
