package com.dsat.lms.domain.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "loginId는 필수입니다.")
        @Size(min = 4, max = 50, message = "loginId는 4자 이상 50자 이하여야 합니다.")
        String loginId,

        @NotBlank(message = "password는 필수입니다.")
        @Size(min = 4, max = 100, message = "password는 4자 이상이어야 합니다.")
        String password,

        @NotBlank(message = "name은 필수입니다.")
        @Size(max = 100, message = "name은 100자 이하여야 합니다.")
        String name
) {
}