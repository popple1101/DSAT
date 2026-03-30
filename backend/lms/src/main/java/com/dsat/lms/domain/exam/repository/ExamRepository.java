package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findAllByActiveTrueOrderByIdDesc();
}
