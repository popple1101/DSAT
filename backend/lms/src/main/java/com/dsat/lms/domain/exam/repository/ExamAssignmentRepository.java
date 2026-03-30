package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.ExamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamAssignmentRepository extends JpaRepository<ExamAssignment, Long> {
}
