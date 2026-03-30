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
@Table(name = "score_tables")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ScoreTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_id", nullable = false, length = 100)
    private String tableId;

    @Enumerated(EnumType.STRING)
    @Column(name = "route_type", nullable = false, length = 20)
    private RouteType routeType;

    @Column(name = "module_1_correct_count", nullable = false)
    private int module1CorrectCount;

    @Column(name = "module_2_correct_count", nullable = false)
    private int module2CorrectCount;

    @Column(name = "total_correct_count", nullable = false)
    private int totalCorrectCount;

    @Column(name = "section_score", nullable = false)
    private int sectionScore;

    @Builder
    public ScoreTable(
            String tableId,
            RouteType routeType,
            int module1CorrectCount,
            int module2CorrectCount,
            int totalCorrectCount,
            int sectionScore
    ) {
        this.tableId = tableId;
        this.routeType = routeType;
        this.module1CorrectCount = module1CorrectCount;
        this.module2CorrectCount = module2CorrectCount;
        this.totalCorrectCount = totalCorrectCount;
        this.sectionScore = sectionScore;
    }

    public static ScoreTable create(
            String tableId,
            RouteType routeType,
            int module1CorrectCount,
            int module2CorrectCount,
            int totalCorrectCount,
            int sectionScore
    ) {
        return ScoreTable.builder()
                .tableId(tableId)
                .routeType(routeType)
                .module1CorrectCount(module1CorrectCount)
                .module2CorrectCount(module2CorrectCount)
                .totalCorrectCount(totalCorrectCount)
                .sectionScore(sectionScore)
                .build();
    }
}
