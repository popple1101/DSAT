package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.RouteType;

import java.util.List;

public record StudentExamResultResponse(
        Long assignmentId,
        Long submissionId,
        Long examId,
        String examTitle,
        String versionName,
        RouteType routeType,
        int totalScore,
        int sectionScore,
        int module1DurationSeconds,
        int module2DurationSeconds,
        int module1CorrectCount,
        int module2CorrectCount,
        List<StudentQuestionResultResponse> questionResults
) {
}
