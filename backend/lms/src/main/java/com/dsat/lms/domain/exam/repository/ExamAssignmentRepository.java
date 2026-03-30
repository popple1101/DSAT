package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.ExamAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExamAssignmentRepository extends JpaRepository<ExamAssignment, Long> {
    List<ExamAssignment> findAllByStudentIdAndActiveTrueOrderByIdDesc(Long studentId);
    Optional<ExamAssignment> findByIdAndActiveTrue(Long assignmentId);
}
