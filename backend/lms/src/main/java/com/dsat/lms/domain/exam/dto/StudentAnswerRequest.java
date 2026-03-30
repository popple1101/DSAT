package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.AnswerOption;
import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import jakarta.validation.constraints.NotNull;

public record StudentAnswerRequest(
        @NotNull(message = "questionId는 필수입니다.")
        Long questionId,

        @NotNull(message = "moduleType은 필수입니다.")
        ModuleType moduleType,

        @NotNull(message = "routeType은 필수입니다.")
        RouteType routeType,

        @NotNull(message = "selectedAnswer는 필수입니다.")
        AnswerOption selectedAnswer
) {
}
