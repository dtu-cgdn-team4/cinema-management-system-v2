package com.cgdn.cinema;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import com.google.firebase.auth.FirebaseAuth;

@SpringBootTest
class CinemaApplicationTests {
    @MockitoBean
    FirebaseAuth firebaseAuth;

    @Test
    void contextLoads() {
    }
}
