package com.dsat.lms.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "login_id", nullable = false, unique = true, length = 50)
    private String loginId;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Builder
    public User(String loginId, String passwordHash, String name, UserRole role, boolean active) {
        this.loginId = loginId;
        this.passwordHash = passwordHash;
        this.name = name;
        this.role = role;
        this.active = active;
    }

    public static User createStudent(String loginId, String passwordHash, String name) {
        return User.builder()
                .loginId(loginId)
                .passwordHash(passwordHash)
                .name(name)
                .role(UserRole.STUDENT)
                .active(true)
                .build();
    }

    public void changePassword(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void deactivate() {
        this.active = false;
    }
}