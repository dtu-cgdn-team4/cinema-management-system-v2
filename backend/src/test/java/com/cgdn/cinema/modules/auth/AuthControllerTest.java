package com.cgdn.cinema.modules.auth;

import com.cgdn.cinema.exception.BusinessException;
import com.cgdn.cinema.exception.ErrorCode;
import com.cgdn.cinema.exception.GlobalExceptionHandler;
import com.cgdn.cinema.modules.auth.controller.AuthController;
import com.cgdn.cinema.modules.auth.dto.response.RegisterResponse;
import com.cgdn.cinema.modules.auth.service.RegistrationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class AuthControllerTest {
    private MockMvc mvc;
    private RegistrationService service;
    private final String valid = """
            {"username":"viewer_1","fullName":"Viewer One","email":"viewer@example.com",
             "phoneNumber":"0901234567","firebaseIdToken":"test-id-token",
             "dateOfBirth":"2000-01-01","gender":"MALE",
             "password":"SecurePass1"}
            """;

    @BeforeEach
    void setUp() {
        service = mock(RegistrationService.class);
        mvc = MockMvcBuilders.standaloneSetup(new AuthController(service))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void successReturns201WithoutPassword() throws Exception {
        when(service.register(any())).thenReturn(new RegisterResponse(1L, "viewer_1", "Viewer One",
                "viewer@example.com", "KHACH_HANG"));
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(valid))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.username").value("viewer_1"))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    void duplicateFieldsReturn409() throws Exception {
        for (var duplicate : new BusinessException[]{
                new BusinessException(ErrorCode.USERNAME_EXISTS, "username"),
                new BusinessException(ErrorCode.EMAIL_EXISTS, "email")}) {
            reset(service);
            when(service.register(any())).thenThrow(duplicate);
            mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON).content(valid))
                    .andExpect(status().isConflict())
                    .andExpect(jsonPath("$.errors." + duplicate.field()).value(duplicate.getMessage()));
        }
    }

    @Test
    void missingAndInvalidFieldsReturn400BeforeSave() throws Exception {
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.username").exists())
                .andExpect(jsonPath("$.errors.fullName").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.phoneNumber").exists())
                .andExpect(jsonPath("$.errors.firebaseIdToken").exists())
                .andExpect(jsonPath("$.errors.dateOfBirth").exists())
                .andExpect(jsonPath("$.errors.gender").exists())
                .andExpect(jsonPath("$.errors.password").exists());
        mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(valid.replace("viewer@example.com", "bad-email")
                                .replace("0901234567", "123")
                                .replace("SecurePass1", "weak")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.phoneNumber").exists())
                .andExpect(jsonPath("$.errors.password").exists());
        verifyNoInteractions(service);
    }

    @Test
    void blankOptionalFieldsAreAccepted() throws Exception {
        when(service.register(any())).thenReturn(new RegisterResponse(1L, "viewer_1", "Viewer One",
                "viewer@example.com", "KHACH_HANG"));
        for (String optional : new String[]{
                "\"idCard\":\"\"", "\"address\":\"\"", "\"idCard\":\"\",\"address\":\"\""}) {
            mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                            .content(valid.replace("\"password\":\"SecurePass1\"",
                                    "\"password\":\"SecurePass1\"," + optional)))
                    .andExpect(status().isCreated());
        }
    }

    @Test
    void weakPasswordsAreRejected() throws Exception {
        for (String password : new String[]{"Short1A", "lowercase1", "UPPERCASE1", "NoNumber"}) {
            mvc.perform(post("/api/v1/auth/register").contentType(MediaType.APPLICATION_JSON)
                            .content(valid.replace("SecurePass1", password)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors.password").exists());
        }
        verifyNoInteractions(service);
    }
}
