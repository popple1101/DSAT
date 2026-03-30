package com.dsat.lms.domain.user.service;

import com.dsat.lms.domain.user.dto.StudentSummaryResponse;
import com.dsat.lms.domain.user.entity.UserRole;
import com.dsat.lms.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminUserService {

    private final UserRepository userRepository;

    public List<StudentSummaryResponse> getStudents() {
        return userRepository.findAllByRoleOrderByIdAsc(UserRole.STUDENT).stream()
                .map(StudentSummaryResponse::from)
                .toList();
    }
}
