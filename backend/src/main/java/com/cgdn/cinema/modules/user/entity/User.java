package com.cgdn.cinema.modules.user.entity;

import com.cgdn.cinema.common.constants.AppConstants;
import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.common.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Thực thể người dùng ánh xạ bảng nguoi_dung trong cơ sở dữ liệu.
 */
@Entity
@Table(name = "nguoi_dung")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tai_khoan", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "mat_khau", length = 255)
    private String password;

    @Column(name = "ho_ten", nullable = false, length = 255)
    private String fullName;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "so_dien_thoai", unique = true, length = 20)
    private String phoneNumber;

    @Column(name = "ngay_sinh")
    private LocalDate dateOfBirth;

    @Column(name = "gioi_tinh", length = 10)
    private String gender;

    @Column(name = "cccd", length = 12)
    private String citizenId;

    @Column(name = "dia_chi", length = 500)
    private String address;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(name = "vai_tro", nullable = false, length = 20)
    private Role role;

    @Column(name = "rap_id")
    private Long cinemaId;

    @Column(name = "google_id", unique = true, length = 255)
    private String googleId;

    @Column(name = "diem_tich_luy", nullable = false)
    private Integer loyaltyPoints = 0;

    @Column(name = "so_lan_dang_nhap_sai", nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column(name = "bi_khoa", nullable = false)
    private Boolean locked = false;

    @JdbcTypeCode(SqlTypes.TINYINT)
    @Column(name = "trang_thai", nullable = false)
    private Integer status = RecordStatus.ACTIVE.getCode();

    @Column(name = "ngay_tao", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "ngay_cap_nhat", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now(AppConstants.ZONE);
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (loyaltyPoints == null) {
            loyaltyPoints = 0;
        }
        if (failedLoginAttempts == null) {
            failedLoginAttempts = 0;
        }
        if (locked == null) {
            locked = false;
        }
        if (status == null) {
            status = RecordStatus.ACTIVE.getCode();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(AppConstants.ZONE);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getCinemaId() {
        return cinemaId;
    }

    public void setCinemaId(Long cinemaId) {
        this.cinemaId = cinemaId;
    }

    public String getGoogleId() {
        return googleId;
    }

    public void setGoogleId(String googleId) {
        this.googleId = googleId;
    }

    public Integer getLoyaltyPoints() {
        return loyaltyPoints;
    }

    public void setLoyaltyPoints(Integer loyaltyPoints) {
        this.loyaltyPoints = loyaltyPoints;
    }

    public Integer getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(Integer failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

