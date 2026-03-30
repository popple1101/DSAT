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
@Table(name = "questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "passage_text", columnDefinition = "TEXT")
    private String passageText;

    @Column(name = "asset_image_path", length = 500)
    private String assetImagePath;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "choice_a", nullable = false, columnDefinition = "TEXT")
    private String choiceA;

    @Column(name = "choice_b", nullable = false, columnDefinition = "TEXT")
    private String choiceB;

    @Column(name = "choice_c", nullable = false, columnDefinition = "TEXT")
    private String choiceC;

    @Column(name = "choice_d", nullable = false, columnDefinition = "TEXT")
    private String choiceD;

    @Enumerated(EnumType.STRING)
    @Column(name = "correct_answer", nullable = false, length = 1)
    private AnswerOption correctAnswer;

    @Column(nullable = false)
    private boolean active;

    @Builder
    public Question(
            String title,
            String passageText,
            String assetImagePath,
            String questionText,
            String choiceA,
            String choiceB,
            String choiceC,
            String choiceD,
            AnswerOption correctAnswer,
            boolean active
    ) {
        this.title = title;
        this.passageText = passageText;
        this.assetImagePath = assetImagePath;
        this.questionText = questionText;
        this.choiceA = choiceA;
        this.choiceB = choiceB;
        this.choiceC = choiceC;
        this.choiceD = choiceD;
        this.correctAnswer = correctAnswer;
        this.active = active;
    }

    public static Question create(
            String title,
            String passageText,
            String assetImagePath,
            String questionText,
            String choiceA,
            String choiceB,
            String choiceC,
            String choiceD,
            AnswerOption correctAnswer
    ) {
        return Question.builder()
                .title(title)
                .passageText(passageText)
                .assetImagePath(assetImagePath)
                .questionText(questionText)
                .choiceA(choiceA)
                .choiceB(choiceB)
                .choiceC(choiceC)
                .choiceD(choiceD)
                .correctAnswer(correctAnswer)
                .active(true)
                .build();
    }

    public void update(
            String title,
            String passageText,
            String assetImagePath,
            String questionText,
            String choiceA,
            String choiceB,
            String choiceC,
            String choiceD,
            AnswerOption correctAnswer
    ) {
        this.title = title;
        this.passageText = passageText;
        this.assetImagePath = assetImagePath;
        this.questionText = questionText;
        this.choiceA = choiceA;
        this.choiceB = choiceB;
        this.choiceC = choiceC;
        this.choiceD = choiceD;
        this.correctAnswer = correctAnswer;
    }
}
