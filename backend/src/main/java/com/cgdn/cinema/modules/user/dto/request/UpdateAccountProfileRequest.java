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
 * Dữ liệu nhận cho PATCH /api/v1/account/me.
 * Chỉ cho phép email, phoneNumber, fullName, dateOfBirth, gender, citizenId và address.
 * Một giá trị null trong Java có thể đến từ JSON null hoặc từ trường vắng mặt; presentFields
 * phân biệt hai trường hợp này để PATCH chỉ xử lý những trường client thực sự gửi.
 * unknownFields giữ cả thuộc tính lạ có giá trị null để service từ chối toàn bộ request.
 */
public class UpdateAccountProfileRequest {

    private String email;
    private String phoneNumber;
    private String fullName;
    private LocalDate dateOfBirth;
    private String gender;
    private String citizenId;
    private String address;

    @JsonIgnore
    private final Set<String> presentFields = new HashSet<>();

    @JsonIgnore
    private final Map<String, Object> unknownFields = new LinkedHashMap<>();

    /** Tạo DTO rỗng để Jackson nạp các trường từ JSON. */
    public UpdateAccountProfileRequest() {
    }

    /** @return email được gửi lên; có thể null khi JSON ghi rõ null hoặc không có trường này */
    public String getEmail() {
        return email;
    }

    /**
     * Ghi nhận email đã xuất hiện trong JSON, kể cả khi giá trị là null.
     * Service sẽ từ chối null/rỗng vì cột email trong CSDL là bắt buộc.
     *
     * @param email email do client gửi lên
     */
    @JsonProperty("email")
    @JsonSetter(nulls = Nulls.SET)
    public void setEmail(String email) {
        this.email = email;
        this.presentFields.add("email");
    }

    /** @return số điện thoại được gửi lên; có thể null khi JSON ghi rõ null hoặc không có trường này */
    public String getPhoneNumber() {
        return phoneNumber;
    }

    /**
     * Ghi nhận số điện thoại đã xuất hiện trong JSON, kể cả khi giá trị là null.
     * Việc theo dõi sự hiện diện của trường không đồng nghĩa với xác minh số điện thoại.
     *
     * @param phoneNumber số điện thoại do client gửi lên
     */
    @JsonProperty("phoneNumber")
    @JsonSetter(nulls = Nulls.SET)
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
        this.presentFields.add("phoneNumber");
    }

    /** @return họ và tên nếu request có cung cấp */
    public String getFullName() {
        return fullName;
    }

    /**
     * Ghi nhận họ tên đã xuất hiện trong JSON, kể cả khi giá trị là null.
     *
     * @param fullName họ tên được gửi lên
     */
    @JsonProperty("fullName")
    // Nulls.SET bảo đảm setter vẫn được gọi khi JSON gửi rõ ràng null.
    @JsonSetter(nulls = Nulls.SET)
    public void setFullName(String fullName) {
        this.fullName = fullName;
        this.presentFields.add("fullName");
    }

    /** @return ngày sinh nếu request có cung cấp */
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    /**
     * Ghi nhận ngày sinh đã xuất hiện trong JSON, kể cả khi giá trị là null.
     *
     * @param dateOfBirth ngày sinh được gửi lên
     */
    @JsonProperty("dateOfBirth")
    @JsonSetter(nulls = Nulls.SET)
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
        this.presentFields.add("dateOfBirth");
    }

    /** @return giới tính nếu request có cung cấp */
    public String getGender() {
        return gender;
    }

    /**
     * Ghi nhận giới tính đã xuất hiện trong JSON, kể cả khi giá trị là null.
     *
     * @param gender giới tính được gửi lên
     */
    @JsonProperty("gender")
    @JsonSetter(nulls = Nulls.SET)
    public void setGender(String gender) {
        this.gender = gender;
        this.presentFields.add("gender");
    }

    /** @return số CCCD/CMND nếu request có cung cấp */
    public String getCitizenId() {
        return citizenId;
    }

    /**
     * Ghi nhận CCCD/CMND đã xuất hiện trong JSON, kể cả khi giá trị là null.
     *
     * @param citizenId số giấy tờ được gửi lên
     */
    @JsonProperty("citizenId")
    @JsonSetter(nulls = Nulls.SET)
    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
        this.presentFields.add("citizenId");
    }

    /** @return địa chỉ nếu request có cung cấp */
    public String getAddress() {
        return address;
    }

    /**
     * Ghi nhận địa chỉ đã xuất hiện trong JSON, kể cả khi giá trị là null.
     *
     * @param address địa chỉ được gửi lên
     */
    @JsonProperty("address")
    @JsonSetter(nulls = Nulls.SET)
    public void setAddress(String address) {
        this.address = address;
        this.presentFields.add("address");
    }

    /**
     * Lưu thuộc tính ngoài hợp đồng để service từ chối, bao gồm cả các trường chỉ đọc
     * như userId, username và role. Không bỏ qua thuộc tính lạ dù client gửi null.
     */
    @JsonAnySetter
    public void handleUnknown(String name, Object value) {
        unknownFields.put(name, value);
    }

    /** @return true nếu JSON có chứa fullName */
    public boolean isFullNamePresent() {
        return presentFields.contains("fullName");
    }

    /** @return true nếu JSON có chứa email, kể cả khi giá trị là null */
    public boolean isEmailPresent() {
        return presentFields.contains("email");
    }

    /** @return true nếu JSON có chứa phoneNumber, kể cả khi giá trị là null */
    public boolean isPhoneNumberPresent() {
        return presentFields.contains("phoneNumber");
    }

    /** @return true nếu JSON có chứa dateOfBirth */
    public boolean isDateOfBirthPresent() {
        return presentFields.contains("dateOfBirth");
    }

    /** @return true nếu JSON có chứa gender */
    public boolean isGenderPresent() {
        return presentFields.contains("gender");
    }

    /** @return true nếu JSON có chứa citizenId */
    public boolean isCitizenIdPresent() {
        return presentFields.contains("citizenId");
    }

    /** @return true nếu JSON có chứa address */
    public boolean isAddressPresent() {
        return presentFields.contains("address");
    }

    /** @return tập tên trường đã xuất hiện, không cho phép bên gọi sửa đổi */
    public Set<String> getPresentFields() {
        return Collections.unmodifiableSet(presentFields);
    }

    /** @return các trường ngoài hợp đồng đã nhận, không cho phép bên gọi sửa đổi */
    public Map<String, Object> getUnknownFields() {
        return Collections.unmodifiableMap(unknownFields);
    }

    /** @return true nếu request chứa ít nhất một trường ngoài hợp đồng */
    public boolean hasUnknownFields() {
        return !unknownFields.isEmpty();
    }
}
