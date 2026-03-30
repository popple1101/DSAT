package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    Optional<Submission> findByAssignmentId(Long assignmentId);
}
