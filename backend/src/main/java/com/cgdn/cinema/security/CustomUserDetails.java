package com.cgdn.cinema.security;

import com.cgdn.cinema.common.enums.RecordStatus;
import com.cgdn.cinema.common.enums.Role;
import com.cgdn.cinema.modules.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;

/**
 * Thông tin xác thực Spring Security gắn với bản ghi User trong CSDL.
 */
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String username;
    private final String password;
    private final Role role;
    private final Long cinemaId;
    private final boolean locked;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.password = user.getPassword();
        this.role = user.getRole();
        this.cinemaId = user.getCinemaId();
        this.locked = Boolean.TRUE.equals(user.getLocked());
        this.enabled = Integer.valueOf(RecordStatus.ACTIVE.getCode()).equals(user.getStatus());
        this.authorities = buildAuthorities(user.getRole());
    }

    private Collection<? extends GrantedAuthority> buildAuthorities(Role role) {
        Set<GrantedAuthority> grantedAuthorities = new LinkedHashSet<>();
        grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role.getSecurityRole()));
        grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        return Set.copyOf(grantedAuthorities);
    }

    public Long getId() {
        return id;
    }

    public Role getRole() {
        return role;
    }

    public Long getCinemaId() {
        return cinemaId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
