package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.ExamAssignment;
import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.entity.SubmissionStatus;

import java.time.LocalDateTime;

public record StudentAssignmentSummaryResponse(
        Long assignmentId,
        Long examId,
        String examTitle,
        String versionName,
        SubmissionStatus submissionStatus,
        RouteType routeType,
        LocalDateTime assignedAt,
        LocalDateTime dueAt
) {
    public static StudentAssignmentSummaryResponse of(ExamAssignment assignment, Submission submission) {
        return new StudentAssignmentSummaryResponse(
                assignment.getId(),
                assignment.getExam().getId(),
                assignment.getExam().getTitle(),
                assignment.getExam().getVersionName(),
                submission.getStatus(),
                submission.getRouteType(),
                assignment.getAssignedAt(),
                assignment.getDueAt()
        );
    }
}
