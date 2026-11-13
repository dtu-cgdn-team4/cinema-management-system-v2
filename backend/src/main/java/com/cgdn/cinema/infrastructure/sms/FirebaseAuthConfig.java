package com.cgdn.cinema.infrastructure.sms;

import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import java.io.IOException;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FirebaseAuthConfig {
    @Bean
    FirebaseAuth firebaseAuth(@Value("${FIREBASE_PROJECT_ID}") String projectId) throws IOException {
        // Auth Emulator không dùng service account; production vẫn lấy credentials mặc định của môi trường.
        GoogleCredentials credentials = System.getenv("FIREBASE_AUTH_EMULATOR_HOST") == null
                ? GoogleCredentials.getApplicationDefault()
                : GoogleCredentials.create(new AccessToken("emulator", new Date(Long.MAX_VALUE)));
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .setProjectId(projectId)
                .build();
        return FirebaseAuth.getInstance(FirebaseApp.initializeApp(options));
    }
}
