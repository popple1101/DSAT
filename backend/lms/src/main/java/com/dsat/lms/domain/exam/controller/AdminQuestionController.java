package com.dsat.lms.domain.exam.controller;

import com.dsat.lms.domain.exam.dto.QuestionRequest;
import com.dsat.lms.domain.exam.dto.QuestionResponse;
import com.dsat.lms.domain.exam.service.QuestionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/questions")
@RequiredArgsConstructor
public class AdminQuestionController {

    private final QuestionService questionService;

    @PostMapping
    public QuestionResponse createQuestion(@Valid @RequestBody QuestionRequest request) {
        return questionService.createQuestion(request);
    }

    @GetMapping
    public List<QuestionResponse> getQuestions() {
        return questionService.getQuestions();
    }

    @GetMapping("/{questionId}")
    public QuestionResponse getQuestion(@PathVariable Long questionId) {
        return questionService.getQuestion(questionId);
    }

    @PutMapping("/{questionId}")
    public QuestionResponse updateQuestion(@PathVariable Long questionId, @Valid @RequestBody QuestionRequest request) {
        return questionService.updateQuestion(questionId, request);
    }
}
