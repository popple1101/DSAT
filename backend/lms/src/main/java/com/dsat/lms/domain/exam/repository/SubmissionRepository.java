package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
}
