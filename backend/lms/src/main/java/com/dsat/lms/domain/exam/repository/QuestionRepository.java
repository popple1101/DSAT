package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
}
