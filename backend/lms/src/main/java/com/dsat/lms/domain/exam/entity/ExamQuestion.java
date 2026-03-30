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
@Table(name = "exam_questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExamQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Enumerated(EnumType.STRING)
    @Column(name = "module_type", nullable = false, length = 20)
    private ModuleType moduleType;

    @Enumerated(EnumType.STRING)
    @Column(name = "route_type", nullable = false, length = 20)
    private RouteType routeType;

    @Column(name = "question_order", nullable = false)
    private int questionOrder;

    @Builder
    public ExamQuestion(Exam exam, Question question, ModuleType moduleType, RouteType routeType, int questionOrder) {
        this.exam = exam;
        this.question = question;
        this.moduleType = moduleType;
        this.routeType = routeType;
        this.questionOrder = questionOrder;
    }

    public static ExamQuestion create(
            Exam exam,
            Question question,
            ModuleType moduleType,
            RouteType routeType,
            int questionOrder
    ) {
        return ExamQuestion.builder()
                .exam(exam)
                .question(question)
                .moduleType(moduleType)
                .routeType(routeType)
                .questionOrder(questionOrder)
                .build();
    }
}
