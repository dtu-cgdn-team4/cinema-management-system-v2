package com.cgdn.cinema.modules.user;

import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.modules.user.service.AccountService;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccountServiceTest {

    @Test
    void returnsCurrentUserProfileWithDerivedMemberCode() {
        UserRepository users = mock(UserRepository.class);
        User user = new User();
        user.setId(128L);
        user.setUsername("nguyenvanan");
        user.setPassword("hashed-secret");
        user.setFullName("Nguyễn Văn An");
        user.setDateOfBirth(LocalDate.of(2002, 8, 15));
        user.setGender("MALE");
        user.setEmail("an@example.com");
        user.setPhoneNumber("0905123456");
        user.setCitizenId("048202001234");
        user.setAddress("Đà Nẵng");
        user.setLoyaltyPoints(1250);
        user.setCreatedAt(LocalDateTime.of(2025, 3, 12, 10, 0));
        when(users.findById(128L)).thenReturn(Optional.of(user));

        var profile = new AccountService(users).getProfile(128L);

        assertEquals("TV0000128", profile.memberCode());
        assertEquals("nguyenvanan", profile.username());
        assertEquals("Nguyễn Văn An", profile.fullName());
        assertEquals(LocalDate.of(2002, 8, 15), profile.dateOfBirth());
        assertEquals("MALE", profile.gender());
        assertEquals("an@example.com", profile.email());
        assertEquals("0905123456", profile.phoneNumber());
        assertEquals("048202001234", profile.citizenId());
        assertEquals("Đà Nẵng", profile.address());
        assertEquals(1250, profile.loyaltyPoints());
        assertEquals(LocalDateTime.of(2025, 3, 12, 10, 0), profile.joinedAt());
        verify(users).findById(128L);
    }

    @Test
    void preservesMissingOptionalDetailsForGoogleAccount() {
        UserRepository users = mock(UserRepository.class);
        User user = new User();
        user.setId(1L);
        when(users.findById(1L)).thenReturn(Optional.of(user));

        var profile = new AccountService(users).getProfile(1L);

        assertEquals("TV0000001", profile.memberCode());
        assertNull(profile.phoneNumber());
        assertNull(profile.dateOfBirth());
    }
}
