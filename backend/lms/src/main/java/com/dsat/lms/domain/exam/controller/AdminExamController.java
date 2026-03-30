package com.dsat.lms.domain.exam.controller;

import com.dsat.lms.domain.exam.dto.ExamAssignmentRequest;
import com.dsat.lms.domain.exam.dto.ExamAssignmentResponse;
import com.dsat.lms.domain.exam.dto.ExamCreateRequest;
import com.dsat.lms.domain.exam.dto.ExamResponse;
import com.dsat.lms.domain.exam.service.ExamAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/exams")
@RequiredArgsConstructor
public class AdminExamController {

    private final ExamAdminService examAdminService;

    @PostMapping
    public ExamResponse createExam(@Valid @RequestBody ExamCreateRequest request) {
        return examAdminService.createExam(request);
    }

    @GetMapping
    public List<ExamResponse> getExams() {
        return examAdminService.getExams();
    }

    @GetMapping("/{examId}")
    public ExamResponse getExam(@PathVariable Long examId) {
        return examAdminService.getExam(examId);
    }

    @PostMapping("/assignments")
    public ExamAssignmentResponse assignExam(@Valid @RequestBody ExamAssignmentRequest request) {
        return examAdminService.assignExam(request);
    }

    @GetMapping("/assignments")
    public List<ExamAssignmentResponse> getAssignmentsByStudent(@RequestParam Long studentId) {
        return examAdminService.getAssignmentsByStudent(studentId);
    }
}
