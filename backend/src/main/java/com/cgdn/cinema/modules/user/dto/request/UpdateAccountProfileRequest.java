package com.cgdn.cinema.modules.user.dto.request;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/**
 * DTO nhận dữ liệu cập nhật hồ sơ cá nhân qua PATCH /api/v1/account/me.
 * Chỉ cho phép 5 trường: fullName, dateOfBirth, gender, citizenId, address.
 * Phân biệt trường vắng mặt với trường gửi null bằng tập presentFields.
 * Bắt tất cả trường lạ hoặc trường chỉ đọc (kể cả khi gửi null) qua unknownFields.
 */
public class UpdateAccountProfileRequest {

    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String citizenId;
    private String address;

    @JsonIgnore
    private final Set<String> presentFields = new HashSet<>();

    @JsonIgnore
    private final Map<String, Object> unknownFields = new LinkedHashMap<>();

    public UpdateAccountProfileRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    @JsonProperty("fullName")
    @JsonSetter(nulls = Nulls.SET)
    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.presentFields.add("fullName");
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    @JsonProperty("dateOfBirth")
    @JsonSetter(nulls = Nulls.SET)
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
        this.presentFields.add("dateOfBirth");
    }

    public String getGender() {
        return gender;
    }

    @JsonProperty("gender")
    @JsonSetter(nulls = Nulls.SET)
    public void setGender(String gender) {
        this.gender = gender;
        this.presentFields.add("gender");
    }

    public String getCitizenId() {
        return citizenId;
    }

    @JsonProperty("citizenId")
    @JsonSetter(nulls = Nulls.SET)
    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
        this.presentFields.add("citizenId");
    }

    public String getAddress() {
        return address;
    }

    @JsonProperty("address")
    @JsonSetter(nulls = Nulls.SET)
    public void setAddress(String address) {
        this.address = address;
        this.presentFields.add("address");
    }

    @JsonAnySetter
    public void handleUnknown(String name, Object value) {
        unknownFields.put(name, value);
    }

    public boolean isFullNamePresent() {
        return presentFields.contains("fullName");
    }

    public boolean isDateOfBirthPresent() {
        return presentFields.contains("dateOfBirth");
    }

    public boolean isGenderPresent() {
        return presentFields.contains("gender");
    }

    public boolean isCitizenIdPresent() {
        return presentFields.contains("citizenId");
    }

    public boolean isAddressPresent() {
        return presentFields.contains("address");
    }

    public Set<String> getPresentFields() {
        return Collections.unmodifiableSet(presentFields);
    }

    public Map<String, Object> getUnknownFields() {
        return Collections.unmodifiableMap(unknownFields);
    }

    public boolean hasUnknownFields() {
        return !unknownFields.isEmpty();
    }
}

