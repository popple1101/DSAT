package com.dsat.lms.domain.exam.service;

import com.dsat.lms.domain.exam.dto.ModuleSubmitRequest;
import com.dsat.lms.domain.exam.dto.ModuleSubmitResponse;
import com.dsat.lms.domain.exam.dto.StudentAnswerRequest;
import com.dsat.lms.domain.exam.dto.StudentAssignmentSummaryResponse;
import com.dsat.lms.domain.exam.dto.StudentExamDetailResponse;
import com.dsat.lms.domain.exam.dto.StudentQuestionResponse;
import com.dsat.lms.domain.exam.entity.ExamAssignment;
import com.dsat.lms.domain.exam.entity.ExamQuestion;
import com.dsat.lms.domain.exam.entity.ModuleType;
import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.ScoreTable;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.entity.SubmissionAnswer;
import com.dsat.lms.domain.exam.entity.SubmissionStatus;
import com.dsat.lms.domain.exam.repository.ExamAssignmentRepository;
import com.dsat.lms.domain.exam.repository.ExamQuestionRepository;
import com.dsat.lms.domain.exam.repository.ScoreTableRepository;
import com.dsat.lms.domain.exam.repository.SubmissionAnswerRepository;
import com.dsat.lms.domain.exam.repository.SubmissionRepository;
import com.dsat.lms.domain.user.entity.User;
import com.dsat.lms.domain.user.entity.UserRole;
import com.dsat.lms.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentExamService {

    private final ExamAssignmentRepository examAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final SubmissionAnswerRepository submissionAnswerRepository;
    private final ScoreTableRepository scoreTableRepository;
    private final UserRepository userRepository;

    public List<StudentAssignmentSummaryResponse> getAssignments(Long studentId) {
        findStudent(studentId);

        return examAssignmentRepository.findAllByStudentIdAndActiveTrueOrderByIdDesc(studentId).stream()
                .map(assignment -> StudentAssignmentSummaryResponse.of(assignment, findSubmissionByAssignmentId(assignment.getId())))
                .toList();
    }

    public StudentExamDetailResponse getAssignmentDetail(Long assignmentId) {
        ExamAssignment assignment = findAssignment(assignmentId);
        Submission submission = findSubmissionByAssignmentId(assignmentId);

        ModuleType moduleType = currentModuleType(submission);
        RouteType routeType = currentRouteType(submission);

        ensureSubmissionAnswers(submission, moduleType, routeType);

        return StudentExamDetailResponse.of(
                assignmentId,
                submission,
                moduleType,
                routeType,
                getQuestionResponses(submission, moduleType, routeType)
        );
    }

    @Transactional
    public StudentExamDetailResponse startModule1(Long assignmentId) {
        Submission submission = findSubmissionByAssignmentId(assignmentId);
        if (submission.getStatus() == SubmissionStatus.SUBMITTED) {
            throw new IllegalArgumentException("이미 제출된 시험입니다.");
        }

        submission.startModule1();
        ensureSubmissionAnswers(submission, ModuleType.MODULE_1, RouteType.COMMON);

        return StudentExamDetailResponse.of(
                assignmentId,
                submission,
                ModuleType.MODULE_1,
                RouteType.COMMON,
                getQuestionResponses(submission, ModuleType.MODULE_1, RouteType.COMMON)
        );
    }

    @Transactional
    public StudentExamDetailResponse saveAnswer(Long assignmentId, StudentAnswerRequest request) {
        Submission submission = findSubmissionByAssignmentId(assignmentId);
        validateEditable(submission, request.moduleType());

        SubmissionAnswer answer = submissionAnswerRepository.findBySubmissionIdAndQuestionId(submission.getId(), request.questionId())
                .orElseThrow(() -> new IllegalArgumentException("답안을 저장할 수 없는 문제입니다."));

        if (answer.getModuleType() != request.moduleType() || answer.getRouteType() != request.routeType()) {
            throw new IllegalArgumentException("현재 모듈과 맞지 않는 문제입니다.");
        }

        answer.answer(request.selectedAnswer());

        return StudentExamDetailResponse.of(
                assignmentId,
                submission,
                request.moduleType(),
                request.routeType(),
                getQuestionResponses(submission, request.moduleType(), request.routeType())
        );
    }

    @Transactional
    public ModuleSubmitResponse submitModule1(Long assignmentId, ModuleSubmitRequest request) {
        Submission submission = findSubmissionByAssignmentId(assignmentId);
        if (submission.getStatus() != SubmissionStatus.MODULE_1_IN_PROGRESS) {
            throw new IllegalArgumentException("Module 1 진행 중일 때만 제출할 수 있습니다.");
        }

        List<SubmissionAnswer> answers = submissionAnswerRepository.findAllBySubmissionIdAndModuleTypeAndRouteTypeOrderByQuestionIdAsc(
                submission.getId(),
                ModuleType.MODULE_1,
                RouteType.COMMON
        );
        answers.forEach(SubmissionAnswer::grade);

        int correctCount = (int) answers.stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getCorrect()))
                .count();

        RouteType routeType = correctCount >= 19 ? RouteType.UPPER : RouteType.LOWER;
        submission.submitModule1(routeType, request.durationSeconds(), correctCount);

        return ModuleSubmitResponse.from(submission);
    }

    @Transactional
    public StudentExamDetailResponse startModule2(Long assignmentId) {
        Submission submission = findSubmissionByAssignmentId(assignmentId);
        if (submission.getStatus() != SubmissionStatus.MODULE_1_SUBMITTED) {
            throw new IllegalArgumentException("Module 1 제출 후에만 Module 2를 시작할 수 있습니다.");
        }

        RouteType routeType = submission.getRouteType();
        if (routeType == null || routeType == RouteType.COMMON) {
            throw new IllegalArgumentException("Module 2 분기 정보가 없습니다.");
        }

        submission.startModule2();
        ensureSubmissionAnswers(submission, ModuleType.MODULE_2, routeType);

        return StudentExamDetailResponse.of(
                assignmentId,
                submission,
                ModuleType.MODULE_2,
                routeType,
                getQuestionResponses(submission, ModuleType.MODULE_2, routeType)
        );
    }

    @Transactional
    public ModuleSubmitResponse submitFinal(Long assignmentId, ModuleSubmitRequest request) {
        Submission submission = findSubmissionByAssignmentId(assignmentId);
        if (submission.getStatus() != SubmissionStatus.MODULE_2_IN_PROGRESS) {
            throw new IllegalArgumentException("Module 2 진행 중일 때만 최종 제출할 수 있습니다.");
        }

        RouteType routeType = submission.getRouteType();
        List<SubmissionAnswer> answers = submissionAnswerRepository.findAllBySubmissionIdAndModuleTypeAndRouteTypeOrderByQuestionIdAsc(
                submission.getId(),
                ModuleType.MODULE_2,
                routeType
        );
        answers.forEach(SubmissionAnswer::grade);

        int correctCount = (int) answers.stream()
                .filter(answer -> Boolean.TRUE.equals(answer.getCorrect()))
                .count();

        int module1CorrectCount = submission.getModule1CorrectCount() == null ? 0 : submission.getModule1CorrectCount();
        ScoreTable scoreTable = scoreTableRepository
                .findByTableIdAndRouteTypeAndModule1CorrectCountAndModule2CorrectCount(
                        submission.getAssignment().getExam().getScoreTableId(),
                        routeType,
                        module1CorrectCount,
                        correctCount
                )
                .orElseThrow(() -> new IllegalArgumentException("점수표를 찾을 수 없습니다."));

        submission.submitFinal(request.durationSeconds(), correctCount, scoreTable.getSectionScore());

        return ModuleSubmitResponse.from(submission);
    }

    private void ensureSubmissionAnswers(Submission submission, ModuleType moduleType, RouteType routeType) {
        List<SubmissionAnswer> existing = submissionAnswerRepository.findAllBySubmissionIdAndModuleTypeAndRouteTypeOrderByQuestionIdAsc(
                submission.getId(),
                moduleType,
                routeType
        );

        if (!existing.isEmpty()) {
            return;
        }

        List<ExamQuestion> examQuestions = examQuestionRepository.findAllByExamIdAndModuleTypeAndRouteTypeOrderByQuestionOrderAsc(
                submission.getAssignment().getExam().getId(),
                moduleType,
                routeType
        );

        List<SubmissionAnswer> answers = examQuestions.stream()
                .map(examQuestion -> SubmissionAnswer.create(
                        submission,
                        examQuestion.getQuestion(),
                        examQuestion.getModuleType(),
                        examQuestion.getRouteType()
                ))
                .toList();

        submissionAnswerRepository.saveAll(answers);
    }

    private List<StudentQuestionResponse> getQuestionResponses(Submission submission, ModuleType moduleType, RouteType routeType) {
        List<ExamQuestion> examQuestions = examQuestionRepository.findAllByExamIdAndModuleTypeAndRouteTypeOrderByQuestionOrderAsc(
                submission.getAssignment().getExam().getId(),
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
                    return StudentQuestionResponse.of(answer, examQuestion.getQuestionOrder());
                })
                .toList();
    }

    private void validateEditable(Submission submission, ModuleType requestedModuleType) {
        if (submission.getStatus() == SubmissionStatus.SUBMITTED) {
            throw new IllegalArgumentException("이미 제출된 시험입니다.");
        }

        if (requestedModuleType == ModuleType.MODULE_1 && submission.getStatus() != SubmissionStatus.MODULE_1_IN_PROGRESS) {
            throw new IllegalArgumentException("현재 Module 1 답안을 수정할 수 없습니다.");
        }

        if (requestedModuleType == ModuleType.MODULE_2 && submission.getStatus() != SubmissionStatus.MODULE_2_IN_PROGRESS) {
            throw new IllegalArgumentException("현재 Module 2 답안을 수정할 수 없습니다.");
        }
    }

    private ModuleType currentModuleType(Submission submission) {
        return switch (submission.getStatus()) {
            case MODULE_2_IN_PROGRESS, SUBMITTED -> ModuleType.MODULE_2;
            default -> ModuleType.MODULE_1;
        };
    }

    private RouteType currentRouteType(Submission submission) {
        if (currentModuleType(submission) == ModuleType.MODULE_2) {
            return submission.getRouteType() == null ? RouteType.LOWER : submission.getRouteType();
        }
        return RouteType.COMMON;
    }

    private ExamAssignment findAssignment(Long assignmentId) {
        return examAssignmentRepository.findByIdAndActiveTrue(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("배정된 시험을 찾을 수 없습니다."));
    }

    private Submission findSubmissionByAssignmentId(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("응시 정보를 찾을 수 없습니다."));
    }

    private User findStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("학생을 찾을 수 없습니다."));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("학생 계정만 조회할 수 있습니다.");
        }

        return student;
    }
}
