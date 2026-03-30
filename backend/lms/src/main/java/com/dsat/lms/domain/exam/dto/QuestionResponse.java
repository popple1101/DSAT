package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.AnswerOption;
import com.dsat.lms.domain.exam.entity.Question;

public record QuestionResponse(
        Long id,
        String title,
        String passageText,
        String assetImagePath,
        String questionText,
        String choiceA,
        String choiceB,
        String choiceC,
        String choiceD,
        AnswerOption correctAnswer
) {
    public static QuestionResponse from(Question question) {
        return new QuestionResponse(
                question.getId(),
                question.getTitle(),
                question.getPassageText(),
                question.getAssetImagePath(),
                question.getQuestionText(),
                question.getChoiceA(),
                question.getChoiceB(),
                question.getChoiceC(),
                question.getChoiceD(),
                question.getCorrectAnswer()
        );
    }
}
