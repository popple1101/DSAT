package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.ExamQuestion;
import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;

public record ExamQuestionLinkResponse(
        Long questionId,
        String title,
        ModuleType moduleType,
        RouteType routeType,
        int questionOrder
) {
    public static ExamQuestionLinkResponse from(ExamQuestion examQuestion) {
        return new ExamQuestionLinkResponse(
                examQuestion.getQuestion().getId(),
                examQuestion.getQuestion().getTitle(),
                examQuestion.getModuleType(),
                examQuestion.getRouteType(),
                examQuestion.getQuestionOrder()
        );
    }
}
