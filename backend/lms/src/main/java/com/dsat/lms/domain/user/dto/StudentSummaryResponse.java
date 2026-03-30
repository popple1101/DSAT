package com.dsat.lms.domain.user.dto;

import com.dsat.lms.domain.user.entity.User;

public record StudentSummaryResponse(
        Long id,
        String loginId,
        String name
) {
    public static StudentSummaryResponse from(User user) {
        return new StudentSummaryResponse(
                user.getId(),
                user.getLoginId(),
                user.getName()
        );
    }
}
