package com.dsat.lms.domain.exam.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ExamCreateRequest(
        @NotBlank(message = "title은 필수입니다.")
        @Size(max = 150, message = "title은 150자 이하여야 합니다.")
        String title,

        @NotBlank(message = "versionName은 필수입니다.")
        @Size(max = 50, message = "versionName은 50자 이하여야 합니다.")
        String versionName,

        @NotBlank(message = "scoreTableId는 필수입니다.")
        @Size(max = 100, message = "scoreTableId는 100자 이하여야 합니다.")
        String scoreTableId,

        @NotEmpty(message = "questions는 1개 이상이어야 합니다.")
        List<@Valid ExamQuestionLinkRequest> questions
) {
}
