package com.dsat.lms.domain.exam.controller;

import com.dsat.lms.domain.exam.dto.StudentExamResultResponse;
import com.dsat.lms.domain.exam.service.StudentResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student/results")
@RequiredArgsConstructor
public class StudentResultController {

    private final StudentResultService studentResultService;

    @GetMapping("/{assignmentId}")
    public StudentExamResultResponse getResult(@PathVariable Long assignmentId) {
        return studentResultService.getResult(assignmentId);
    }
}
