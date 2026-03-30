package com.dsat.lms.domain.exam.dto;

import jakarta.validation.constraints.Min;

public record ModuleSubmitRequest(
        @Min(value = 0, message = "durationSeconds는 0 이상이어야 합니다.")
        int durationSeconds
) {
}
