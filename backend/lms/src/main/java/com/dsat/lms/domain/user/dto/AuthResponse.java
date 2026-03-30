package com.dsat.lms.domain.user.dto;

public record AuthResponse(
        Long userId,
        String loginId,
        String name,
        String role,
        String accessToken
) {
}