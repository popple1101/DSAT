package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ExamQuestionLinkRequest(
        @NotNull(message = "questionId는 필수입니다.")
        Long questionId,

        @NotNull(message = "moduleType은 필수입니다.")
        ModuleType moduleType,

        @NotNull(message = "routeType은 필수입니다.")
        RouteType routeType,

        @Min(value = 1, message = "questionOrder는 1 이상이어야 합니다.")
        int questionOrder
) {
}
