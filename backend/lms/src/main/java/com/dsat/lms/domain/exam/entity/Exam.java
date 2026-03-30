package com.dsat.lms.domain.exam.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "exams")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExamType type;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "version_name", nullable = false, length = 50)
    private String versionName;

    @Column(name = "module_1_duration_seconds", nullable = false)
    private int module1DurationSeconds;

    @Column(name = "module_2_duration_seconds", nullable = false)
    private int module2DurationSeconds;

    @Column(name = "score_table_id", nullable = false, length = 100)
    private String scoreTableId;

    @Column(nullable = false)
    private boolean active;

    @Builder
    public Exam(
            ExamType type,
            String title,
            String versionName,
            int module1DurationSeconds,
            int module2DurationSeconds,
            String scoreTableId,
            boolean active
    ) {
        this.type = type;
        this.title = title;
        this.versionName = versionName;
        this.module1DurationSeconds = module1DurationSeconds;
        this.module2DurationSeconds = module2DurationSeconds;
        this.scoreTableId = scoreTableId;
        this.active = active;
    }

    public static Exam createLevelTest(String title, String versionName, String scoreTableId) {
        return Exam.builder()
                .type(ExamType.LEVEL_TEST)
                .title(title)
                .versionName(versionName)
                .module1DurationSeconds(32 * 60)
                .module2DurationSeconds(32 * 60)
                .scoreTableId(scoreTableId)
                .active(true)
                .build();
    }
}
