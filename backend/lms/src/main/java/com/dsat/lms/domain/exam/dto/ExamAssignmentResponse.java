package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.ExamAssignment;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.entity.SubmissionStatus;

import java.time.LocalDateTime;

public record ExamAssignmentResponse(
        Long assignmentId,
        Long examId,
        String examTitle,
        String versionName,
        Long studentId,
        String studentName,
        LocalDateTime assignedAt,
        LocalDateTime dueAt,
        SubmissionStatus submissionStatus
) {
    public static ExamAssignmentResponse of(ExamAssignment assignment, Submission submission) {
        return new ExamAssignmentResponse(
                assignment.getId(),
                assignment.getExam().getId(),
                assignment.getExam().getTitle(),
                assignment.getExam().getVersionName(),
                assignment.getStudent().getId(),
                assignment.getStudent().getName(),
                assignment.getAssignedAt(),
                assignment.getDueAt(),
                submission.getStatus()
        );
    }
}
