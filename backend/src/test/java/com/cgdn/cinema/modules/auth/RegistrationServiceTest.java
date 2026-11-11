package com.cgdn.cinema.modules.auth;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.modules.auth.dto.request.RegisterRequest;
import com.cgdn.cinema.modules.auth.service.RegistrationService;
import com.cgdn.cinema.modules.user.entity.NguoiDung;
import com.cgdn.cinema.modules.user.repository.NguoiDungRepository;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RegistrationServiceTest {
    private NguoiDungRepository users;
    private RegistrationService service;
    private RegisterRequest valid;

    @BeforeEach
    void setUp() {
        users = mock(NguoiDungRepository.class);
        service = new RegistrationService(users);
        valid = new RegisterRequest("viewer_1", "Viewer One", "VIEWER@example.com", "0901234567",
                LocalDate.of(2000, 1, 1), "MALE", "SecurePass1", null, null);
    }

    @Test
    void savesOnlyHashAndReturnsSafeResponse() {
        when(users.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var response = service.register(valid);
        var user = org.mockito.ArgumentCaptor.forClass(NguoiDung.class);
        verify(users).saveAndFlush(user.capture());
        assertThat(user.getValue().getMatKhau()).isNotEqualTo(valid.password());
        assertThat(new BCryptPasswordEncoder().matches(valid.password(), user.getValue().getMatKhau())).isTrue();
        assertThat(user.getValue().getVaiTro()).isEqualTo("KHACH_HANG");
        assertThat(response.email()).isEqualTo("viewer@example.com");
        assertThat(response.toString()).doesNotContain(valid.password());
    }

    @Test
    void rejectsExistingUsernameAndEmailWithoutSaving() {
        when(users.existsByTaiKhoan("viewer_1")).thenReturn(true);
        assertThatThrownBy(() -> service.register(valid)).isInstanceOf(BusinessException.class)
                .extracting("field").isEqualTo("username");
        when(users.existsByTaiKhoan("viewer_1")).thenReturn(false);
        when(users.existsByEmail("viewer@example.com")).thenReturn(true);
        assertThatThrownBy(() -> service.register(valid)).isInstanceOf(BusinessException.class)
                .extracting("field").isEqualTo("email");
        verify(users, never()).saveAndFlush(any());
    }

    @Test
    void mapsUniqueKeyRaceToFieldConflict() {
        when(users.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException(
                "Duplicate entry for key 'uk_nguoi_dung_email'"));
        assertThatThrownBy(() -> service.register(valid)).isInstanceOf(BusinessException.class)
                .extracting("field").isEqualTo("email");
    }

    @Test
    void rejectsUnderageAndOverageWithoutSaving() {
        for (LocalDate date : new LocalDate[]{LocalDate.now().minusYears(12), LocalDate.now().minusYears(121)}) {
            var request = new RegisterRequest(valid.username(), valid.fullName(), valid.email(),
                    valid.phoneNumber(), date, valid.gender(), valid.password(), null, null);
            assertThatThrownBy(() -> service.register(request)).isInstanceOf(BusinessException.class)
                    .extracting("field").isEqualTo("dateOfBirth");
        }
        verify(users, never()).saveAndFlush(any());
    }

    @Test
    void rejectsNameThatBecomesTooShortAfterTrimming() {
        var request = new RegisterRequest(valid.username(), " A ", valid.email(), valid.phoneNumber(),
                valid.dateOfBirth(), valid.gender(), valid.password(), null, null);
        assertThatThrownBy(() -> service.register(request)).isInstanceOf(BusinessException.class)
                .extracting("field").isEqualTo("fullName");
        verify(users, never()).saveAndFlush(any());
    }

    @Test
    void blankOptionalFieldsAreStoredAsNull() {
        when(users.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var request = new RegisterRequest(valid.username(), valid.fullName(), valid.email(),
                valid.phoneNumber(), valid.dateOfBirth(), valid.gender(), valid.password(), "", "   ");
        service.register(request);
        var user = org.mockito.ArgumentCaptor.forClass(NguoiDung.class);
        verify(users).saveAndFlush(user.capture());
        assertThat(user.getValue().getCccd()).isNull();
        assertThat(user.getValue().getDiaChi()).isNull();
    }

    @Test
    void shortNonblankAddressIsRejected() {
        var request = new RegisterRequest(valid.username(), valid.fullName(), valid.email(),
                valid.phoneNumber(), valid.dateOfBirth(), valid.gender(), valid.password(), null, "abc");
        assertThatThrownBy(() -> service.register(request)).isInstanceOf(BusinessException.class)
                .extracting("field").isEqualTo("address");
        verify(users, never()).saveAndFlush(any());
    }
}
