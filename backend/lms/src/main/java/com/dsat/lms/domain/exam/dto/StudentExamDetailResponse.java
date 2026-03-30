package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.entity.SubmissionStatus;

import java.util.List;

public record StudentExamDetailResponse(
        Long assignmentId,
        Long submissionId,
        Long examId,
        String examTitle,
        String versionName,
        SubmissionStatus submissionStatus,
        ModuleType currentModuleType,
        RouteType currentRouteType,
        Integer module1DurationSeconds,
        Integer module2DurationSeconds,
        List<StudentQuestionResponse> questions
) {
    public static StudentExamDetailResponse of(
            Long assignmentId,
            Submission submission,
            ModuleType currentModuleType,
            RouteType currentRouteType,
            List<StudentQuestionResponse> questions
    ) {
        return new StudentExamDetailResponse(
                assignmentId,
                submission.getId(),
                submission.getAssignment().getExam().getId(),
                submission.getAssignment().getExam().getTitle(),
                submission.getAssignment().getExam().getVersionName(),
                submission.getStatus(),
                currentModuleType,
                currentRouteType,
                submission.getModule1DurationSeconds(),
                submission.getModule2DurationSeconds(),
                questions
        );
    }
}
