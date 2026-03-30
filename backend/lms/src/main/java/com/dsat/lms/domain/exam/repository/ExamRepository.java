package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
}
