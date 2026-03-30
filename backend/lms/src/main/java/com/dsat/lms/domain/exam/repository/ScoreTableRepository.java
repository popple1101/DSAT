package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.ScoreTable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScoreTableRepository extends JpaRepository<ScoreTable, Long> {
}
