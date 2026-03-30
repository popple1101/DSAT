package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.ScoreTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ScoreTableRepository extends JpaRepository<ScoreTable, Long> {
    Optional<ScoreTable> findByTableIdAndRouteTypeAndModule1CorrectCountAndModule2CorrectCount(
            String tableId,
            RouteType routeType,
            int module1CorrectCount,
            int module2CorrectCount
    );
}
