package com.dsat.lms.domain.exam.service;

import com.dsat.lms.domain.exam.dto.ExamAssignmentRequest;
import com.dsat.lms.domain.exam.dto.ExamAssignmentResponse;
import com.dsat.lms.domain.exam.dto.ExamCreateRequest;
import com.dsat.lms.domain.exam.dto.ExamQuestionLinkResponse;
import com.dsat.lms.domain.exam.dto.ExamResponse;
import com.dsat.lms.domain.exam.entity.Exam;
import com.dsat.lms.domain.exam.entity.ExamAssignment;
import com.dsat.lms.domain.exam.entity.ExamQuestion;
import com.dsat.lms.domain.exam.entity.Question;
import com.dsat.lms.domain.exam.entity.Submission;
import com.dsat.lms.domain.exam.repository.ExamAssignmentRepository;
import com.dsat.lms.domain.exam.repository.ExamQuestionRepository;
import com.dsat.lms.domain.exam.repository.ExamRepository;
import com.dsat.lms.domain.exam.repository.QuestionRepository;
import com.dsat.lms.domain.exam.repository.SubmissionRepository;
import com.dsat.lms.domain.user.entity.User;
import com.dsat.lms.domain.user.entity.UserRole;
import com.dsat.lms.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExamAdminService {

    private final ExamRepository examRepository;
    private final ExamQuestionRepository examQuestionRepository;
    private final QuestionRepository questionRepository;
    private final ExamAssignmentRepository examAssignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;

    @Transactional
    public ExamResponse createExam(ExamCreateRequest request) {
        Exam exam = Exam.createLevelTest(request.title(), request.versionName(), request.scoreTableId());
        Exam savedExam = examRepository.save(exam);

        List<ExamQuestion> links = request.questions().stream()
                .map(link -> ExamQuestion.create(
                        savedExam,
                        findQuestion(link.questionId()),
                        link.moduleType(),
                        link.routeType(),
                        link.questionOrder()
                ))
                .toList();

        examQuestionRepository.saveAll(links);

        return toExamResponse(savedExam, links);
    }

    public List<ExamResponse> getExams() {
        return examRepository.findAllByActiveTrueOrderByIdDesc().stream()
                .map(this::toExamResponse)
                .toList();
    }

    public ExamResponse getExam(Long examId) {
        return toExamResponse(findExam(examId));
    }

    @Transactional
    public ExamAssignmentResponse assignExam(ExamAssignmentRequest request) {
        Exam exam = findExam(request.examId());
        User student = findStudent(request.studentId());

        ExamAssignment assignment = examAssignmentRepository.save(
                ExamAssignment.create(exam, student, request.dueAt())
        );
        Submission submission = submissionRepository.save(Submission.create(assignment));

        return ExamAssignmentResponse.of(assignment, submission);
    }

    public List<ExamAssignmentResponse> getAssignmentsByStudent(Long studentId) {
        findStudent(studentId);

        return examAssignmentRepository.findAllByStudentIdAndActiveTrueOrderByIdDesc(studentId).stream()
                .map(assignment -> ExamAssignmentResponse.of(
                        assignment,
                        submissionRepository.findByAssignmentId(assignment.getId())
                                .orElseThrow(() -> new IllegalArgumentException("응시 정보가 없습니다."))
                ))
                .toList();
    }

    private ExamResponse toExamResponse(Exam exam) {
        List<ExamQuestion> links = examQuestionRepository.findAllByExamIdOrderByModuleTypeAscRouteTypeAscQuestionOrderAsc(exam.getId());
        return toExamResponse(exam, links);
    }

    private ExamResponse toExamResponse(Exam exam, List<ExamQuestion> links) {
        return ExamResponse.of(
                exam,
                links.stream()
                        .map(ExamQuestionLinkResponse::from)
                        .toList()
        );
    }

    private Exam findExam(Long examId) {
        return examRepository.findById(examId)
                .filter(Exam::isActive)
                .orElseThrow(() -> new IllegalArgumentException("시험을 찾을 수 없습니다."));
    }

    private Question findQuestion(Long questionId) {
        return questionRepository.findById(questionId)
                .filter(Question::isActive)
                .orElseThrow(() -> new IllegalArgumentException("문제를 찾을 수 없습니다."));
    }

    private User findStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("학생을 찾을 수 없습니다."));

        if (student.getRole() != UserRole.STUDENT) {
            throw new IllegalArgumentException("학생 계정만 배정할 수 있습니다.");
        }

        return student;
    }
}
