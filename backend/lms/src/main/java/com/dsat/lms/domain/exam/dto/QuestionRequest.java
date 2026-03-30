package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.AnswerOption;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionRequest(

        @NotBlank(message = "title은 필수입니다.")
        @Size(max = 150, message = "title은 150자 이하여야 합니다.")
        String title,

        String passageText,

        @Size(max = 500, message = "assetImagePath는 500자 이하여야 합니다.")
        String assetImagePath,

        @NotBlank(message = "questionText는 필수입니다.")
        String questionText,

        @NotBlank(message = "choiceA는 필수입니다.")
        String choiceA,

        @NotBlank(message = "choiceB는 필수입니다.")
        String choiceB,

        @NotBlank(message = "choiceC는 필수입니다.")
        String choiceC,

        @NotBlank(message = "choiceD는 필수입니다.")
        String choiceD,

        @NotNull(message = "correctAnswer는 필수입니다.")
        AnswerOption correctAnswer
) {
}
