package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.Exam;
import com.dsat.lms.domain.exam.entity.ExamType;

import java.util.List;

public record ExamResponse(
        Long id,
        ExamType type,
        String title,
        String versionName,
        int module1DurationSeconds,
        int module2DurationSeconds,
        String scoreTableId,
        List<ExamQuestionLinkResponse> questions
) {
    public static ExamResponse of(Exam exam, List<ExamQuestionLinkResponse> questions) {
        return new ExamResponse(
                exam.getId(),
                exam.getType(),
                exam.getTitle(),
                exam.getVersionName(),
                exam.getModule1DurationSeconds(),
                exam.getModule2DurationSeconds(),
                exam.getScoreTableId(),
                questions
        );
    }
}
