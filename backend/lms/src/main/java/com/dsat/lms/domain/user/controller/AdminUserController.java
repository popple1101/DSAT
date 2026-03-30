package com.dsat.lms.domain.user.controller;

import com.dsat.lms.domain.user.dto.StudentSummaryResponse;
import com.dsat.lms.domain.user.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/students")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public List<StudentSummaryResponse> getStudents() {
        return adminUserService.getStudents();
    }
}
