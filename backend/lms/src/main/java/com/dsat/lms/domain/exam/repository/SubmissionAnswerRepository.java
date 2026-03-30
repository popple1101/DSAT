package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.SubmissionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionAnswerRepository extends JpaRepository<SubmissionAnswer, Long> {
}
