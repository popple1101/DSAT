package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.AnswerOption;
import com.dsat.lms.domain.exam.entity.SubmissionAnswer;

public record StudentQuestionResponse(
        Long questionId,
        int questionOrder,
        String title,
        String passageText,
        String assetImagePath,
        String questionText,
        String choiceA,
        String choiceB,
        String choiceC,
        String choiceD,
        AnswerOption selectedAnswer
) {
    public static StudentQuestionResponse of(SubmissionAnswer answer, int questionOrder) {
        return new StudentQuestionResponse(
                answer.getQuestion().getId(),
                questionOrder,
                answer.getQuestion().getTitle(),
                answer.getQuestion().getPassageText(),
                answer.getQuestion().getAssetImagePath(),
                answer.getQuestion().getQuestionText(),
                answer.getQuestion().getChoiceA(),
                answer.getQuestion().getChoiceB(),
                answer.getQuestion().getChoiceC(),
                answer.getQuestion().getChoiceD(),
                answer.getSelectedAnswer()
        );
    }
}
