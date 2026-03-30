package com.dsat.lms.domain.exam.service;

import com.dsat.lms.domain.exam.dto.QuestionRequest;
import com.dsat.lms.domain.exam.dto.QuestionResponse;
import com.dsat.lms.domain.exam.entity.Question;
import com.dsat.lms.domain.exam.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuestionService {

    private final QuestionRepository questionRepository;

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request) {
        Question question = Question.create(
                request.title(),
                blankToNull(request.passageText()),
                blankToNull(request.assetImagePath()),
                request.questionText(),
                request.choiceA(),
                request.choiceB(),
                request.choiceC(),
                request.choiceD(),
                request.correctAnswer()
        );

        return QuestionResponse.from(questionRepository.save(question));
    }

    public List<QuestionResponse> getQuestions() {
        return questionRepository.findAllByActiveTrueOrderByIdDesc().stream()
                .map(QuestionResponse::from)
                .toList();
    }

    public QuestionResponse getQuestion(Long questionId) {
        return QuestionResponse.from(findQuestion(questionId));
    }

    @Transactional
    public QuestionResponse updateQuestion(Long questionId, QuestionRequest request) {
        Question question = findQuestion(questionId);
        question.update(
                request.title(),
                blankToNull(request.passageText()),
                blankToNull(request.assetImagePath()),
                request.questionText(),
                request.choiceA(),
                request.choiceB(),
                request.choiceC(),
                request.choiceD(),
                request.correctAnswer()
        );

        return QuestionResponse.from(question);
    }

    private Question findQuestion(Long questionId) {
        return questionRepository.findById(questionId)
                .filter(Question::isActive)
                .orElseThrow(() -> new IllegalArgumentException("문제를 찾을 수 없습니다."));
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }
}
