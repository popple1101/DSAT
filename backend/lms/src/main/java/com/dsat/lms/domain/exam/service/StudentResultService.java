package com.dsat.lms.domain.exam.service;

import com.dsat.lms.domain.exam.dto.StudentExamResultResponse;
import com.dsat.lms.domain.exam.dto.StudentQuestionResultResponse;
import com.dsat.lms.domain.exam.entity.ExamAssignment;
import com.dsat.lms.domain.exam.entity.ExamQuestion;
import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.entity.SubmissionAnswer;
import com.dsat.lms.domain.exam.entity.SubmissionStatus;
import com.dsat.lms.domain.exam.repository.ExamAssignmentRepository;
import com.dsat.lms.domain.exam.repository.ExamQuestionRepository;
import com.dsat.lms.domain.exam.repository.SubmissionAnswerRepository;
import com.dsat.lms.domain.exam.repository.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentResultService {

    private final ExamAssignmentRepository examAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final SubmissionAnswerRepository submissionAnswerRepository;

    public StudentExamResultResponse getResult(Long assignmentId) {
        ExamAssignment assignment = examAssignmentRepository.findByIdAndActiveTrue(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("배정된 시험을 찾을 수 없습니다."));
        Submission submission = submissionRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("응시 정보를 찾을 수 없습니다."));

        if (submission.getStatus() != SubmissionStatus.SUBMITTED) {
            throw new IllegalArgumentException("아직 제출되지 않은 시험입니다.");
        }

        List<StudentQuestionResultResponse> questionResults = new ArrayList<>();
        questionResults.addAll(buildQuestionResults(assignment, submission, ModuleType.MODULE_1, RouteType.COMMON));
        questionResults.addAll(buildQuestionResults(assignment, submission, ModuleType.MODULE_2, submission.getRouteType()));

        return new StudentExamResultResponse(
                assignment.getId(),
                submission.getId(),
                assignment.getExam().getId(),
                assignment.getExam().getTitle(),
                assignment.getExam().getVersionName(),
                submission.getRouteType(),
                safeValue(submission.getTotalScore()),
                safeValue(submission.getSectionScore()),
                safeValue(submission.getModule1DurationSeconds()),
                safeValue(submission.getModule2DurationSeconds()),
                safeValue(submission.getModule1CorrectCount()),
                safeValue(submission.getModule2CorrectCount()),
                questionResults
        );
    }

    private List<StudentQuestionResultResponse> buildQuestionResults(
            ExamAssignment assignment,
            Submission submission,
            ModuleType moduleType,
            RouteType routeType
    ) {
        List<ExamQuestion> examQuestions = examQuestionRepository.findAllByExamIdAndModuleTypeAndRouteTypeOrderByQuestionOrderAsc(
                assignment.getExam().getId(),
                moduleType,
                routeType
        );
        Map<Long, SubmissionAnswer> answerMap = submissionAnswerRepository
                .findAllBySubmissionIdAndModuleTypeAndRouteTypeOrderByQuestionIdAsc(submission.getId(), moduleType, routeType)
                .stream()
                .collect(Collectors.toMap(answer -> answer.getQuestion().getId(), Function.identity()));

        return examQuestions.stream()
                .sorted(Comparator.comparingInt(ExamQuestion::getQuestionOrder))
                .map(examQuestion -> {
                    SubmissionAnswer answer = answerMap.get(examQuestion.getQuestion().getId());
                    return new StudentQuestionResultResponse(
                            moduleType,
                            routeType,
                            examQuestion.getQuestionOrder(),
                            examQuestion.getQuestion().getId(),
                            examQuestion.getQuestion().getTitle(),
                            examQuestion.getQuestion().getCorrectAnswer(),
                            answer.getSelectedAnswer(),
                            Boolean.TRUE.equals(answer.getCorrect())
                    );
                })
                .toList();
    }

    private int safeValue(Integer value) {
        return value == null ? 0 : value;
    }
}
