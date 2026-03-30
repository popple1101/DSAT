package com.dsat.lms.domain.exam.repository;

import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.SubmissionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubmissionAnswerRepository extends JpaRepository<SubmissionAnswer, Long> {
    List<SubmissionAnswer> findAllBySubmissionIdOrderByQuestionIdAsc(Long submissionId);
    List<SubmissionAnswer> findAllBySubmissionIdAndModuleTypeAndRouteTypeOrderByQuestionIdAsc(
            Long submissionId,
            ModuleType moduleType,
            RouteType routeType
    );
    Optional<SubmissionAnswer> findBySubmissionIdAndQuestionId(Long submissionId, Long questionId);
}
