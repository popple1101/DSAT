package com.dsat.lms.domain.exam.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record ExamAssignmentRequest(
        @NotNull(message = "examId는 필수입니다.")
        Long examId,

        @NotNull(message = "studentId는 필수입니다.")
        Long studentId,

        LocalDateTime dueAt
) {
}
