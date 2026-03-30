package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.ExamQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
}
