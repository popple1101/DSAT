package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findAllByActiveTrueOrderByIdDesc();
}
