package com.dsat.lms.domain.exam.entity;

import com.dsat.lms.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "exam_assignments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ExamAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt;

    @Column(name = "due_at")
    private LocalDateTime dueAt;

    @Column(nullable = false)
    private boolean active;

    @Builder
    public ExamAssignment(Exam exam, User student, LocalDateTime assignedAt, LocalDateTime dueAt, boolean active) {
        this.exam = exam;
        this.student = student;
        this.assignedAt = assignedAt;
        this.dueAt = dueAt;
        this.active = active;
    }

    public static ExamAssignment create(Exam exam, User student, LocalDateTime dueAt) {
        return ExamAssignment.builder()
                .exam(exam)
                .student(student)
                .assignedAt(LocalDateTime.now())
                .dueAt(dueAt)
                .active(true)
                .build();
    }
}
