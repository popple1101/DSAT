package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.AnswerOption;
import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;

public record StudentQuestionResultResponse(
        ModuleType moduleType,
        RouteType routeType,
        int questionOrder,
        Long questionId,
        String title,
        AnswerOption correctAnswer,
        AnswerOption selectedAnswer,
        boolean correct
) {
}
