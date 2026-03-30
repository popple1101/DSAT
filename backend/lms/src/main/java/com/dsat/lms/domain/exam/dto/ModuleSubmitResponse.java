package com.dsat.lms.domain.exam.dto;

import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.entity.SubmissionStatus;

public record ModuleSubmitResponse(
        Long submissionId,
        SubmissionStatus submissionStatus,
        RouteType routeType,
        Integer module1CorrectCount,
        Integer module2CorrectCount,
        Integer sectionScore
) {
    public static ModuleSubmitResponse from(Submission submission) {
        return new ModuleSubmitResponse(
                submission.getId(),
                submission.getStatus(),
                submission.getRouteType(),
                submission.getModule1CorrectCount(),
                submission.getModule2CorrectCount()
                ,
                submission.getSectionScore()
        );
    }
}
