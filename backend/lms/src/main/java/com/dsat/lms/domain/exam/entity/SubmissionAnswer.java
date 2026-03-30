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

@Entity
@Table(name = "submission_answers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SubmissionAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(name = "module_type", nullable = false, length = 20)
    private ModuleType moduleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "route_type", nullable = false, length = 20)
    private RouteType routeType;

    @Enumerated(EnumType.STRING)
    @Column(name = "selected_answer", length = 1)
    private AnswerOption selectedAnswer;

    @Column(name = "is_correct")
    private Boolean correct;

    @Builder
    public SubmissionAnswer(
            Submission submission,
            Question question,
            ModuleType moduleType,
            RouteType routeType,
            AnswerOption selectedAnswer,
            Boolean correct
    ) {
        this.submission = submission;
        this.question = question;
        this.moduleType = moduleType;
        this.routeType = routeType;
        this.selectedAnswer = selectedAnswer;
        this.correct = correct;
    }

    public static SubmissionAnswer create(Submission submission, Question question, ModuleType moduleType, RouteType routeType) {
        return SubmissionAnswer.builder()
                .submission(submission)
                .question(question)
                .moduleType(moduleType)
                .routeType(routeType)
                .build();
    }

    public void answer(AnswerOption selectedAnswer) {
        this.selectedAnswer = selectedAnswer;
    }

    public void grade() {
        this.correct = selectedAnswer != null && question.getCorrectAnswer() == selectedAnswer;
    }
}
