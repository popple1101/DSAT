package com.dsat.lms.domain.exam.controller;

import com.dsat.lms.domain.exam.dto.ModuleSubmitRequest;
import com.dsat.lms.domain.exam.dto.ModuleSubmitResponse;
import com.dsat.lms.domain.exam.dto.StudentAnswerRequest;
import com.dsat.lms.domain.exam.dto.StudentAssignmentSummaryResponse;
import com.dsat.lms.domain.exam.dto.StudentExamDetailResponse;
import com.dsat.lms.domain.exam.service.StudentExamService;
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
@RequestMapping("/api/student/exams")
@RequiredArgsConstructor
public class StudentExamController {

    private final StudentExamService studentExamService;

    @GetMapping
    public List<StudentAssignmentSummaryResponse> getAssignments(@RequestParam Long studentId) {
        return studentExamService.getAssignments(studentId);
    }

    @GetMapping("/assignments/{assignmentId}")
    public StudentExamDetailResponse getAssignmentDetail(@PathVariable Long assignmentId) {
        return studentExamService.getAssignmentDetail(assignmentId);
    }

    @PostMapping("/assignments/{assignmentId}/start")
    public StudentExamDetailResponse startModule1(@PathVariable Long assignmentId) {
        return studentExamService.startModule1(assignmentId);
    }

    @PostMapping("/assignments/{assignmentId}/answers")
    public StudentExamDetailResponse saveAnswer(
            @PathVariable Long assignmentId,
            @Valid @RequestBody StudentAnswerRequest request
    ) {
        return studentExamService.saveAnswer(assignmentId, request);
    }

    @PostMapping("/assignments/{assignmentId}/module-1/submit")
    public ModuleSubmitResponse submitModule1(
            @PathVariable Long assignmentId,
            @Valid @RequestBody ModuleSubmitRequest request
    ) {
        return studentExamService.submitModule1(assignmentId, request);
    }

    @PostMapping("/assignments/{assignmentId}/module-2/start")
    public StudentExamDetailResponse startModule2(@PathVariable Long assignmentId) {
        return studentExamService.startModule2(assignmentId);
    }

    @PostMapping("/assignments/{assignmentId}/submit")
    public ModuleSubmitResponse submitFinal(
            @PathVariable Long assignmentId,
            @Valid @RequestBody ModuleSubmitRequest request
    ) {
        return studentExamService.submitFinal(assignmentId, request);
    }
}
