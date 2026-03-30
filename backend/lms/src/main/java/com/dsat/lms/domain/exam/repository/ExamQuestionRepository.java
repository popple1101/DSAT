package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.ExamQuestion;
import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExamQuestionRepository extends JpaRepository<ExamQuestion, Long> {
    List<ExamQuestion> findAllByExamIdOrderByModuleTypeAscRouteTypeAscQuestionOrderAsc(Long examId);
    List<ExamQuestion> findAllByExamIdAndModuleTypeAndRouteTypeOrderByQuestionOrderAsc(
            Long examId,
            ModuleType moduleType,
            RouteType routeType
    );
}
