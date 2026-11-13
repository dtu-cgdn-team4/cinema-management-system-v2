package com.cgdn.cinema.modules.auth;

import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.common.enums.Role;
import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.modules.user.entity.User;
import com.cgdn.cinema.modules.user.repository.UserRepository;
import com.cgdn.cinema.security.GoogleTokenVerifier;
import com.cgdn.cinema.security.GoogleUserClaims;
import com.google.firebase.auth.FirebaseAuth;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @MockitoBean
    FirebaseAuth firebaseAuth;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StubGoogleTokenVerifier stubGoogleTokenVerifier;

    private User activeCustomer;
    private Long defaultCinemaId;

    static class StubGoogleTokenVerifier implements GoogleTokenVerifier {

        private final Map<String, GoogleUserClaims> idTokens = new HashMap<>();
        private final Map<String, GoogleUserClaims> authCodes = new HashMap<>();
        private String authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=test";

        void reset() {
            idTokens.clear();
            authCodes.clear();
            authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth?client_id=test";
        }

        void registerIdToken(String idToken, GoogleUserClaims claims) {
            idTokens.put(idToken, claims);
        }

        void registerAuthCode(String code, GoogleUserClaims claims) {
            authCodes.put(code, claims);
        }

        @Override
        public GoogleUserClaims verifyIdToken(String idToken) {
            GoogleUserClaims claims = idTokens.get(idToken);
            if (claims == null) {
                throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }
            return claims;
        }

        @Override
        public GoogleUserClaims exchangeAuthorizationCode(String code) {
            GoogleUserClaims claims = authCodes.get(code);
            if (claims == null) {
                throw new BusinessException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }
            return claims;
        }

        @Override
        public String buildAuthorizationUrl(String state) {
            return authorizationUrl + "&state=" + state;
        }
    }

    @TestConfiguration
    static class TestBeansConfig {

        @Bean
        @Primary
        StubGoogleTokenVerifier stubGoogleTokenVerifier() {
            return new StubGoogleTokenVerifier();
        }

        @RestController
        static class RoleTestController {

            @GetMapping("/api/v1/admin/ping")
            public Map<String, String> adminPing() {
                return Map.of("role", "ADMIN");
            }

            @GetMapping("/api/v1/staff/ping")
            public Map<String, String> staffPing() {
                return Map.of("role", "STAFF");
            }

            @GetMapping("/api/v1/user-only/ping")
            @PreAuthorize("hasRole('USER')")
            public Map<String, String> userOnlyPing() {
                return Map.of("role", "USER");
            }
        }
    }

    @BeforeEach
    void setUp() {
        stubGoogleTokenVerifier.reset();
        userRepository.deleteAll();
        jdbcTemplate.update("DELETE FROM rap");

        jdbcTemplate.update(
                "INSERT INTO rap (ten_rap, thanh_pho, dia_chi, so_dien_thoai, gio_mo_cua, gio_dong_cua, hinh_anh_url, trang_thai) "
                        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                "Rap Da Nang", "Da Nang", "123 Nguyen Van Linh", "0236123456",
                "08:00:00", "23:30:00", "https://example.com/rap.jpg", 1
        );
        defaultCinemaId = jdbcTemplate.queryForObject("SELECT id FROM rap LIMIT 1", Long.class);

        activeCustomer = createUser(
                "khachhang01", "khach01@cinema.vn", "0901234567",
                Role.KHACH_HANG, null, RecordStatus.ACTIVE.getCode()
        );
        userRepository.save(activeCustomer);
    }

    @Test
    void login_withValidUsername_returnsJwtAndResetsFailedAttempts() throws Exception {
        activeCustomer.setFailedLoginAttempts(2);
        userRepository.save(activeCustomer);

        String token = loginAndGetToken("khachhang01", "Secret@123");

        User reloaded = userRepository.findByUsername("khachhang01").orElseThrow();
        assertThat(reloaded.getFailedLoginAttempts()).isZero();
        assertThat(reloaded.getLocked()).isFalse();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.email").value("khach01@cinema.vn"))
                .andExpect(jsonPath("$.data.roleCode").value("USER"));
    }

    @Test
    void login_withEmail_succeeds() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("khach01@cinema.vn", "Secret@123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.user.username").value("khachhang01"))
                .andExpect(jsonPath("$.data.user.role").value("KHACH_HANG"))
                .andExpect(jsonPath("$.data.user.roleCode").value("USER"));
    }

    @Test
    void jwtAuthorization_enforcesAdminStaffAndUserRoles() throws Exception {
        userRepository.save(createUser(
                "nhanvien01", "staff01@cinema.vn", "0902223333",
                Role.NHAN_VIEN, defaultCinemaId, RecordStatus.ACTIVE.getCode()
        ));
        userRepository.save(createUser(
                "admin01", "admin01@cinema.vn", "0903334444",
                Role.ADMIN, null, RecordStatus.ACTIVE.getCode()
        ));

        String userToken = loginAndGetToken("khachhang01", "Secret@123");
        String staffToken = loginAndGetToken("nhanvien01", "Secret@123");
        String adminToken = loginAndGetToken("admin01", "Secret@123");

        mockMvc.perform(get("/api/v1/user-only/ping").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/staff/ping").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
        mockMvc.perform(get("/api/v1/admin/ping").header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));

        mockMvc.perform(get("/api/v1/staff/ping").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/admin/ping").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));
        mockMvc.perform(get("/api/v1/user-only/ping").header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.errorCode").value("FORBIDDEN"));

        mockMvc.perform(get("/api/v1/staff/ping").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/admin/ping").header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void login_wrongPasswordFiveTimes_temporarilyLocksAndAutoUnlocksAfterDuration() throws Exception {
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(loginBody("khachhang01", "WrongPassword")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.code").value(401))
                    .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));
        }

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("khachhang01", "WrongPassword")))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value(423))
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_LOCKED"));

        User lockedUser = userRepository.findByUsername("khachhang01").orElseThrow();
        assertThat(lockedUser.getFailedLoginAttempts()).isEqualTo(5);
        assertThat(lockedUser.getLocked()).isTrue();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("khachhang01", "Secret@123")))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value(423))
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_LOCKED"));

        LocalDateTime sixteenMinutesAgo = LocalDateTime.now(AppConstants.ZONE).minusMinutes(16);
        jdbcTemplate.update("UPDATE nguoi_dung SET ngay_cap_nhat = ? WHERE id = ?",
                sixteenMinutesAgo, lockedUser.getId());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("khachhang01", "Secret@123")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty());

        User unlockedUser = userRepository.findByUsername("khachhang01").orElseThrow();
        assertThat(unlockedUser.getLocked()).isFalse();
        assertThat(unlockedUser.getFailedLoginAttempts()).isZero();
    }

    @Test
    void login_expiredTemporaryLockWithWrongPassword_resetsCountToOne() throws Exception {
        activeCustomer.setFailedLoginAttempts(5);
        activeCustomer.setLocked(true);
        userRepository.save(activeCustomer);

        LocalDateTime sixteenMinutesAgo = LocalDateTime.now(AppConstants.ZONE).minusMinutes(16);
        jdbcTemplate.update("UPDATE nguoi_dung SET ngay_cap_nhat = ? WHERE id = ?",
                sixteenMinutesAgo, activeCustomer.getId());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("khachhang01", "WrongAgain")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"));

        User reloaded = userRepository.findByUsername("khachhang01").orElseThrow();
        assertThat(reloaded.getLocked()).isFalse();
        assertThat(reloaded.getFailedLoginAttempts()).isEqualTo(1);
    }

    @Test
    void login_adminManualLock_remainsLockedAfterTimePasses() throws Exception {
        activeCustomer.setLocked(true);
        activeCustomer.setFailedLoginAttempts(0);
        userRepository.save(activeCustomer);

        LocalDateTime thirtyMinutesAgo = LocalDateTime.now(AppConstants.ZONE).minusMinutes(30);
        jdbcTemplate.update("UPDATE nguoi_dung SET ngay_cap_nhat = ? WHERE id = ?",
                thirtyMinutesAgo, activeCustomer.getId());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("khachhang01", "Secret@123")))
                .andExpect(status().isLocked())
                .andExpect(jsonPath("$.code").value(423))
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_LOCKED"));
    }

    @Test
    void login_softDeletedAccount_returnsForbidden() throws Exception {
        User deletedUser = createUser(
                "deleted01", "deleted01@cinema.vn", "0909998888",
                Role.KHACH_HANG, null, RecordStatus.DELETED.getCode()
        );
        userRepository.save(deletedUser);

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("deleted01", "Secret@123")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403))
                .andExpect(jsonPath("$.errorCode").value("ACCOUNT_DISABLED"));
    }

    @Test
    void login_blankFields_returnsValidationError() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody("", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.data.username").isNotEmpty())
                .andExpect(jsonPath("$.data.password").isNotEmpty());
    }

    @Test
    void getCurrentUser_withoutToken_returnsUnauthorizedJson() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void accountProfile_requiresTokenAndReturnsOnlyTokenOwnersPublicFields() throws Exception {
        mockMvc.perform(get("/api/v1/account/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));

        activeCustomer.setCitizenId("048202001234");
        activeCustomer.setAddress("Đà Nẵng");
        activeCustomer.setLoyaltyPoints(120);
        userRepository.save(activeCustomer);
        User other = userRepository.save(createUser(
                "khachhang02", "khach02@cinema.vn", "0909876543",
                Role.KHACH_HANG, null, RecordStatus.ACTIVE.getCode()));

        String token = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");
        MvcResult result = mockMvc.perform(get("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.memberCode").value(String.format("TV%07d", activeCustomer.getId())))
                .andExpect(jsonPath("$.data.username").value(activeCustomer.getUsername()))
                .andExpect(jsonPath("$.data.fullName").value(activeCustomer.getFullName()))
                .andExpect(jsonPath("$.data.email").value(activeCustomer.getEmail()))
                .andExpect(jsonPath("$.data.phoneNumber").value(activeCustomer.getPhoneNumber()))
                .andExpect(jsonPath("$.data.citizenId").value("048202001234"))
                .andExpect(jsonPath("$.data.address").value("Đà Nẵng"))
                .andExpect(jsonPath("$.data.loyaltyPoints").value(120))
                .andExpect(jsonPath("$.data.joinedAt").isNotEmpty())
                .andReturn();

        JsonNode profile = objectMapper.readTree(result.getResponse().getContentAsString()).path("data");
        Set<String> fields = new HashSet<>();
        profile.fieldNames().forEachRemaining(fields::add);
        assertThat(fields).containsExactlyInAnyOrderElementsOf(
                Set.of("memberCode", "username", "fullName", "dateOfBirth", "gender", "email",
                        "phoneNumber", "citizenId", "address", "loyaltyPoints", "joinedAt"));

        String otherToken = loginAndGetToken(other.getUsername(), "Secret@123");
        mockMvc.perform(get("/api/v1/account/me")
                        .header("Authorization", "Bearer " + otherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value(other.getUsername()))
                .andExpect(jsonPath("$.data.memberCode").value(String.format("TV%07d", other.getId())));
    }

    @Test
    void updateAccountProfile_withoutToken_returnsUnauthorized() throws Exception {
        mockMvc.perform(patch("/api/v1/account/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Người Dùng Mới\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    void updateAccountProfile_partialUpdate_preservesAbsentFields() throws Exception {
        activeCustomer.setCitizenId("048202001234");
        activeCustomer.setAddress("Đà Nẵng");
        activeCustomer.setLoyaltyPoints(120);
        userRepository.save(activeCustomer);

        String token = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");

        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Nguyễn Văn Đổi Tên\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn Đổi Tên"))
                .andExpect(jsonPath("$.data.username").value(activeCustomer.getUsername()))
                .andExpect(jsonPath("$.data.email").value(activeCustomer.getEmail()))
                .andExpect(jsonPath("$.data.phoneNumber").value(activeCustomer.getPhoneNumber()))
                .andExpect(jsonPath("$.data.citizenId").value("048202001234"))
                .andExpect(jsonPath("$.data.address").value("Đà Nẵng"))
                .andExpect(jsonPath("$.data.loyaltyPoints").value(120))
                .andExpect(jsonPath("$.data.dateOfBirth").value("2000-01-15"))
                .andExpect(jsonPath("$.data.gender").value("NAM"));

        User reloaded = userRepository.findById(activeCustomer.getId()).orElseThrow();
        assertThat(reloaded.getFullName()).isEqualTo("Nguyễn Văn Đổi Tên");
        assertThat(reloaded.getCitizenId()).isEqualTo("048202001234");
        assertThat(reloaded.getAddress()).isEqualTo("Đà Nẵng");
        assertThat(reloaded.getEmail()).isEqualTo(activeCustomer.getEmail());
        assertThat(reloaded.getPhoneNumber()).isEqualTo(activeCustomer.getPhoneNumber());
    }

    @Test
    void updateAccountProfile_clearsOptionalFieldsWithNull() throws Exception {
        activeCustomer.setCitizenId("048202001234");
        activeCustomer.setAddress("Đà Nẵng");
        userRepository.save(activeCustomer);

        String token = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");

        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"address\":null,\"citizenId\":null,\"dateOfBirth\":null,\"gender\":null}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.fullName").value(activeCustomer.getFullName()))
                .andExpect(jsonPath("$.data.address").doesNotExist())
                .andExpect(jsonPath("$.data.citizenId").doesNotExist())
                .andExpect(jsonPath("$.data.dateOfBirth").doesNotExist())
                .andExpect(jsonPath("$.data.gender").doesNotExist());

        User reloaded = userRepository.findById(activeCustomer.getId()).orElseThrow();
        assertThat(reloaded.getAddress()).isNull();
        assertThat(reloaded.getCitizenId()).isNull();
        assertThat(reloaded.getDateOfBirth()).isNull();
        assertThat(reloaded.getGender()).isNull();
        assertThat(reloaded.getFullName()).isEqualTo(activeCustomer.getFullName());
    }

    @Test
    void updateAccountProfile_blankOrInvalidFullName_returnsBadRequest() throws Exception {
        String token = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");

        // null fullName
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // empty fullName
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // whitespace fullName
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // 1 char fullName
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"A\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void updateAccountProfile_rejectsUnknownAndReadOnlyFields() throws Exception {
        String token = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");

        // email có giá trị
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"hacker@cinema.vn\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // email có giá trị null
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // phoneNumber có giá trị null
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phoneNumber\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // phoneNumber có giá trị
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phoneNumber\":\"0909999999\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // role
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"role\":\"ADMIN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // loyaltyPoints
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"loyaltyPoints\":9999}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // userId
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":123}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // trường lạ bất kỳ
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"strangeField\":\"hack\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void updateAccountProfile_rejectsInvalidData() throws Exception {
        String token = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");

        // ngày sinh không hợp lệ: tuổi < 13
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dateOfBirth\":\"2025-01-01\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // định dạng ngày sinh sai
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"dateOfBirth\":\"not-a-date\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // giới tính sai
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"gender\":\"UNKNOWN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // CMND/CCCD sai định dạng (không phải 9 hoặc 12 số)
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"citizenId\":\"12345\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));

        // địa chỉ ngắn hơn 5 ký tự
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"address\":\"HN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void updateAccountProfile_userACannotModifyUserB() throws Exception {
        User other = userRepository.save(createUser(
                "khachhang02", "khach02@cinema.vn", "0909876543",
                Role.KHACH_HANG, null, RecordStatus.ACTIVE.getCode()));
        other.setFullName("User B Original");
        other.setAddress("Hà Nội");
        userRepository.save(other);

        String tokenA = loginAndGetToken(activeCustomer.getUsername(), "Secret@123");

        // User A gửi yêu cầu cập nhật tên của mình
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"User A New Name\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("User A New Name"));

        // User B không hề bị ảnh hưởng
        User userBAfter = userRepository.findById(other.getId()).orElseThrow();
        assertThat(userBAfter.getFullName()).isEqualTo("User B Original");
        assertThat(userBAfter.getAddress()).isEqualTo("Hà Nội");

        // User B kiểm tra profile qua token của chính mình
        String tokenB = loginAndGetToken(other.getUsername(), "Secret@123");
        mockMvc.perform(get("/api/v1/account/me")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullName").value("User B Original"))
                .andExpect(jsonPath("$.data.username").value("khachhang02"));

        // User A cố tình gửi thêm userId của User B trong body -> bị từ chối 400
        mockMvc.perform(patch("/api/v1/account/me")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"userId\":" + other.getId() + ",\"fullName\":\"Tamper Attempt\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void googleLogin_newUser_createsCustomerAccountAndReturnsJwt() throws Exception {
        stubGoogleTokenVerifier.registerIdToken(
                "valid-google-token",
                new GoogleUserClaims("google-sub-123", "newuser@gmail.com", "Nguyen Google")
        );

        MvcResult result = mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idToken", "valid-google-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("newuser@gmail.com"))
                .andExpect(jsonPath("$.data.user.fullName").value("Nguyen Google"))
                .andExpect(jsonPath("$.data.user.role").value("KHACH_HANG"))
                .andExpect(jsonPath("$.data.user.roleCode").value("USER"))
                .andReturn();

        User created = userRepository.findByGoogleId("google-sub-123").orElseThrow();
        assertThat(created.getPassword()).isNull();
        assertThat(created.getPhoneNumber()).isNull();
        assertThat(created.getDateOfBirth()).isNull();
        assertThat(created.getGender()).isNull();
        assertThat(created.getStatus()).isEqualTo(RecordStatus.ACTIVE.getCode());

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        String token = root.path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("newuser@gmail.com"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(created.getUsername(), "any-pass")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errorCode").value("GOOGLE_PASSWORD_NOT_SET"));
    }

    @Test
    void googleLogin_existingUserByEmail_linksGoogleIdAndReturnsJwt() throws Exception {
        stubGoogleTokenVerifier.registerIdToken(
                "link-token",
                new GoogleUserClaims("google-sub-999", "KHACH01@cinema.vn", "Nguyen Van A")
        );

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idToken", "link-token"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.id").value(activeCustomer.getId()))
                .andExpect(jsonPath("$.data.user.username").value("khachhang01"));

        User updated = userRepository.findById(activeCustomer.getId()).orElseThrow();
        assertThat(updated.getGoogleId()).isEqualTo("google-sub-999");
    }

    @Test
    void googleLogin_mismatchedGoogleId_returnsConflict() throws Exception {
        activeCustomer.setGoogleId("existing-google-sub");
        userRepository.save(activeCustomer);

        stubGoogleTokenVerifier.registerIdToken(
                "other-sub-token",
                new GoogleUserClaims("different-google-sub", "khach01@cinema.vn", "Other")
        );

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idToken", "other-sub-token"))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409))
                .andExpect(jsonPath("$.errorCode").value("GOOGLE_ACCOUNT_MISMATCH"));
    }

    @Test
    void googleLogin_invalidTokenOrBlankToken_returnsErrors() throws Exception {
        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idToken", "bad-token"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.errorCode").value("INVALID_GOOGLE_TOKEN"));

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("idToken", ""))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"));
    }

    @Test
    void googleAuthUrlAndCallback_succeed() throws Exception {
        MvcResult urlResult = mockMvc.perform(get("/api/v1/auth/google/url"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.authorizationUrl").isNotEmpty())
                .andReturn();

        String stateCookie = urlResult.getResponse().getCookie("GOOGLE_OAUTH_STATE").getValue();
        String authUrl = objectMapper.readTree(urlResult.getResponse().getContentAsString())
                .path("data").path("authorizationUrl").asText();
        assertThat(authUrl).contains("state=" + stateCookie);

        stubGoogleTokenVerifier.registerAuthCode(
                "auth-code-123",
                new GoogleUserClaims("google-code-sub", "callback@gmail.com", "Callback User")
        );

        mockMvc.perform(get("/api/v1/auth/google/callback")
                        .param("code", "auth-code-123")
                        .param("state", stateCookie)
                        .cookie(new jakarta.servlet.http.Cookie("GOOGLE_OAUTH_STATE", stateCookie)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("callback@gmail.com"));

        mockMvc.perform(get("/api/v1/auth/google/callback"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.errorCode").value("INVALID_REQUEST"));
    }

    private String loginAndGetToken(String username, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody(username, password)))
                .andExpect(status().isOk())
                .andReturn();
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("accessToken").asText();
    }

    private User createUser(String username, String email, String phone, Role role, Long cinemaId, int status) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("Secret@123"));
        user.setFullName("Nguyen Van A");
        user.setEmail(email);
        user.setPhoneNumber(phone);
        user.setDateOfBirth(LocalDate.of(2000, 1, 15));
        user.setGender("NAM");
        user.setRole(role);
        user.setCinemaId(cinemaId);
        user.setStatus(status);
        return user;
    }

    private String loginBody(String username, String password) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "username", username,
                "password", password
        ));
    }
}
