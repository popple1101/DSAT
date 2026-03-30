package com.dsat.lms.domain.exam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "submissions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id", nullable = false)
    private ExamAssignment assignment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubmissionStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "route_type", length = 20)
    private RouteType routeType;

    @Column(name = "module_1_started_at")
    private LocalDateTime module1StartedAt;

    @Column(name = "module_1_submitted_at")
    private LocalDateTime module1SubmittedAt;

    @Column(name = "module_2_started_at")
    private LocalDateTime module2StartedAt;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;

    @Column(name = "module_1_duration_seconds")
    private Integer module1DurationSeconds;

    @Column(name = "module_2_duration_seconds")
    private Integer module2DurationSeconds;

    @Column(name = "module_1_correct_count")
    private Integer module1CorrectCount;

    @Column(name = "module_2_correct_count")
    private Integer module2CorrectCount;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "section_score")
    private Integer sectionScore;

    @Builder
    public Submission(
            ExamAssignment assignment,
            SubmissionStatus status,
            RouteType routeType,
            LocalDateTime module1StartedAt,
            LocalDateTime module1SubmittedAt,
            LocalDateTime module2StartedAt,
            LocalDateTime submittedAt,
            Integer module1DurationSeconds,
            Integer module2DurationSeconds,
            Integer module1CorrectCount,
            Integer module2CorrectCount,
            Integer totalScore,
            Integer sectionScore
    ) {
        this.assignment = assignment;
        this.status = status;
        this.routeType = routeType;
        this.module1StartedAt = module1StartedAt;
        this.module1SubmittedAt = module1SubmittedAt;
        this.module2StartedAt = module2StartedAt;
        this.submittedAt = submittedAt;
        this.module1DurationSeconds = module1DurationSeconds;
        this.module2DurationSeconds = module2DurationSeconds;
        this.module1CorrectCount = module1CorrectCount;
        this.module2CorrectCount = module2CorrectCount;
        this.totalScore = totalScore;
        this.sectionScore = sectionScore;
    }

    public static Submission create(ExamAssignment assignment) {
        return Submission.builder()
                .assignment(assignment)
                .status(SubmissionStatus.NOT_STARTED)
                .build();
    }

    public void startModule1() {
        if (this.module1StartedAt == null) {
            this.module1StartedAt = LocalDateTime.now();
        }
        this.status = SubmissionStatus.MODULE_1_IN_PROGRESS;
    }

    public void submitModule1(RouteType routeType, int module1DurationSeconds, int module1CorrectCount) {
        this.status = SubmissionStatus.MODULE_1_SUBMITTED;
        this.routeType = routeType;
        this.module1SubmittedAt = LocalDateTime.now();
        this.module1DurationSeconds = module1DurationSeconds;
        this.module1CorrectCount = module1CorrectCount;
    }

    public void startModule2() {
        if (this.module2StartedAt == null) {
            this.module2StartedAt = LocalDateTime.now();
        }
        this.status = SubmissionStatus.MODULE_2_IN_PROGRESS;
    }

    public void submitFinal(int module2DurationSeconds, int module2CorrectCount, int sectionScore) {
        this.status = SubmissionStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
        this.module2DurationSeconds = module2DurationSeconds;
        this.module2CorrectCount = module2CorrectCount;
        this.totalScore = sectionScore;
        this.sectionScore = sectionScore;
    }
}
