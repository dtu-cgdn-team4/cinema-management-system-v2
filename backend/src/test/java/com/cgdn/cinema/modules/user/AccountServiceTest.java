package com.cgdn.cinema.modules.user;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.user.dto.request.UpdateAccountProfileRequest;
import com.cgdn.cinema.modules.user.dto.response.AccountProfileResponse;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.modules.user.service.AccountService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AccountServiceTest {

    private UserRepository users;
    private AccountService accountService;
    private final Clock fixedClock = Clock.fixed(Instant.parse("2026-11-13T10:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        accountService = new AccountService(users, fixedClock);
    }

    @Test
    void returnsCurrentUserProfileWithDerivedMemberCode() {
        User user = createSampleUser(128L);
        when(users.findById(128L)).thenReturn(Optional.of(user));

        AccountProfileResponse profile = accountService.getProfile(128L);

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
        User user = new User();
        user.setId(1L);
        when(users.findById(1L)).thenReturn(Optional.of(user));

        AccountProfileResponse profile = accountService.getProfile(1L);

        assertEquals("TV0000001", profile.memberCode());
        assertNull(profile.phoneNumber());
        assertNull(profile.dateOfBirth());
    }

    @Test
    void missingCurrentUserReturnsNotFound() {
        when(users.findById(42L)).thenReturn(Optional.empty());

        BusinessException error = assertThrows(BusinessException.class,
                () -> accountService.getProfile(42L));

        assertEquals(ErrorCode.USER_NOT_FOUND, error.getErrorCode());
    }

    @Test
    void testJacksonNullAndUnknownDeserialization() throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        // Trường tùy chọn gửi null -> isPresent = true, value = null
        UpdateAccountProfileRequest req1 = mapper.readValue("{\"address\": null}", UpdateAccountProfileRequest.class);
        assertTrue(req1.isAddressPresent());
        assertNull(req1.getAddress());
        assertFalse(req1.isFullNamePresent());
        assertFalse(req1.hasUnknownFields());

        // Trường không trong hợp đồng kể cả gửi null cũng bị bắt vào unknownFields
        UpdateAccountProfileRequest req2 = mapper.readValue("{\"email\": null}", UpdateAccountProfileRequest.class);
        assertTrue(req2.hasUnknownFields());
        assertTrue(req2.getUnknownFields().containsKey("email"));

        // Trường không trong hợp đồng gửi có giá trị
        UpdateAccountProfileRequest req3 = mapper.readValue("{\"phoneNumber\": \"0901234567\"}", UpdateAccountProfileRequest.class);
        assertTrue(req3.hasUnknownFields());
        assertTrue(req3.getUnknownFields().containsKey("phoneNumber"));

        // Body rỗng -> không có trường nào present, không có trường lạ
        UpdateAccountProfileRequest req4 = mapper.readValue("{}", UpdateAccountProfileRequest.class);
        assertFalse(req4.isFullNamePresent());
        assertFalse(req4.isAddressPresent());
        assertFalse(req4.hasUnknownFields());
    }

    @Test
    void updateProfile_partialUpdate_updatesOnlyProvidedFieldsAndPreservesOthers() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAccountProfileRequest request = new UpdateAccountProfileRequest();
        request.setFullName("Nguyễn Văn Mới");

        AccountProfileResponse response = accountService.updateProfile(10L, request);

        assertEquals("Nguyễn Văn Mới", response.fullName());
        assertEquals(LocalDate.of(2002, 8, 15), response.dateOfBirth());
        assertEquals("MALE", response.gender());
        assertEquals("048202001234", response.citizenId());
        assertEquals("Đà Nẵng", response.address());
        assertEquals("an@example.com", response.email());
        assertEquals("0905123456", response.phoneNumber());
        assertEquals("nguyenvanan", response.username());
    }

    @Test
    void updateProfile_clearsOptionalFieldsWhenNull() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAccountProfileRequest request = new UpdateAccountProfileRequest();
        request.setDateOfBirth(null);
        request.setGender(null);
        request.setCitizenId(null);
        request.setAddress(null);

        AccountProfileResponse response = accountService.updateProfile(10L, request);

        assertEquals("Nguyễn Văn An", response.fullName());
        assertNull(response.dateOfBirth());
        assertNull(response.gender());
        assertNull(response.citizenId());
        assertNull(response.address());
    }

    @Test
    void updateProfile_clearsCitizenIdAndAddressWhenBlank() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));
        when(users.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        UpdateAccountProfileRequest request = new UpdateAccountProfileRequest();
        request.setCitizenId("   ");
        request.setAddress("   ");

        AccountProfileResponse response = accountService.updateProfile(10L, request);

        assertNull(response.citizenId());
        assertNull(response.address());
    }

    @Test
    void updateProfile_rejectsUnknownOrReadOnlyFields() {
        UpdateAccountProfileRequest request = new UpdateAccountProfileRequest();
        request.handleUnknown("email", null);

        BusinessException ex = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, request));
        assertEquals(ErrorCode.INVALID_REQUEST, ex.getErrorCode());
        verify(users, never()).save(any());
    }

    @Test
    void updateProfile_rejectsBlankOrInvalidFullName() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));

        // null fullName
        UpdateAccountProfileRequest nullReq = new UpdateAccountProfileRequest();
        nullReq.setFullName(null);
        BusinessException exNull = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, nullReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exNull.getErrorCode());
        assertEquals("fullName", exNull.field());

        // empty / whitespace fullName
        UpdateAccountProfileRequest blankReq = new UpdateAccountProfileRequest();
        blankReq.setFullName("   ");
        BusinessException exBlank = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, blankReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exBlank.getErrorCode());
        assertEquals("fullName", exBlank.field());

        // too short (< 2 ký tự sau khi trim)
        UpdateAccountProfileRequest shortReq = new UpdateAccountProfileRequest();
        shortReq.setFullName(" A ");
        BusinessException exShort = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, shortReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exShort.getErrorCode());
        assertEquals("fullName", exShort.field());

        // too long (> 150 ký tự)
        UpdateAccountProfileRequest longReq = new UpdateAccountProfileRequest();
        longReq.setFullName("A".repeat(151));
        BusinessException exLong = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, longReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exLong.getErrorCode());
        assertEquals("fullName", exLong.field());
    }

    @Test
    void updateProfile_rejectsInvalidAge() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));

        // Dưới 13 tuổi (ở mốc fixedClock 2026-11-13)
        UpdateAccountProfileRequest underAgeReq = new UpdateAccountProfileRequest();
        underAgeReq.setDateOfBirth(LocalDate.of(2015, 1, 1));
        BusinessException exUnder = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, underAgeReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exUnder.getErrorCode());
        assertEquals("dateOfBirth", exUnder.field());

        // Trên 120 tuổi
        UpdateAccountProfileRequest overAgeReq = new UpdateAccountProfileRequest();
        overAgeReq.setDateOfBirth(LocalDate.of(1900, 1, 1));
        BusinessException exOver = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, overAgeReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exOver.getErrorCode());
        assertEquals("dateOfBirth", exOver.field());
    }

    @Test
    void updateProfile_rejectsInvalidGender() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));

        UpdateAccountProfileRequest req = new UpdateAccountProfileRequest();
        req.setGender("KHONG_XAC_DINH");
        BusinessException ex = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, req));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertEquals("gender", ex.field());
    }

    @Test
    void updateProfile_rejectsInvalidCitizenId() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));

        UpdateAccountProfileRequest req = new UpdateAccountProfileRequest();
        req.setCitizenId("12345678"); // 8 chữ số
        BusinessException ex = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, req));
        assertEquals(ErrorCode.VALIDATION_ERROR, ex.getErrorCode());
        assertEquals("citizenId", ex.field());
    }

    @Test
    void updateProfile_rejectsInvalidAddressLength() {
        User user = createSampleUser(10L);
        when(users.findById(10L)).thenReturn(Optional.of(user));

        // ngắn hơn 5 ký tự
        UpdateAccountProfileRequest shortReq = new UpdateAccountProfileRequest();
        shortReq.setAddress("ABC");
        BusinessException exShort = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, shortReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exShort.getErrorCode());
        assertEquals("address", exShort.field());

        // dài hơn 255 ký tự
        UpdateAccountProfileRequest longReq = new UpdateAccountProfileRequest();
        longReq.setAddress("A".repeat(256));
        BusinessException exLong = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(10L, longReq));
        assertEquals(ErrorCode.VALIDATION_ERROR, exLong.getErrorCode());
        assertEquals("address", exLong.field());
    }

    @Test
    void updateProfile_userNotFound_throwsNotFound() {
        when(users.findById(999L)).thenReturn(Optional.empty());

        UpdateAccountProfileRequest req = new UpdateAccountProfileRequest();
        req.setFullName("Tên Mới");

        BusinessException ex = assertThrows(BusinessException.class,
                () -> accountService.updateProfile(999L, req));
        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    private User createSampleUser(Long id) {
        User user = new User();
        user.setId(id);
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
        return user;
    }
}
