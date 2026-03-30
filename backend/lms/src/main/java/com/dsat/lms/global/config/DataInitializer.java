package com.dsat.lms.global.config;

import com.dsat.lms.domain.exam.entity.RouteType;
import com.dsat.lms.domain.exam.entity.ScoreTable;
import com.dsat.lms.domain.exam.repository.ScoreTableRepository;
import com.dsat.lms.domain.user.entity.User;
import com.dsat.lms.domain.user.entity.UserRole;
import com.dsat.lms.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ScoreTableRepository scoreTableRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfMissing("superadmin", "1234", "최고관리자", UserRole.SUPER_ADMIN);
        createUserIfMissing("manager", "1234", "운영관리자", UserRole.ADMIN_MANAGER);
        createUserIfMissing("teacher", "1234", "강사관리자", UserRole.ADMIN_TEACHER);
        createUserIfMissing("student01", "1234", "데모학생", UserRole.STUDENT);
        seedScoreTablesIfMissing("RW_DEFAULT_V1");
    }

    private void createUserIfMissing(String loginId, String password, String name, UserRole role) {
        if (userRepository.findByLoginId(loginId).isPresent()) {
            return;
        }

        User user = User.builder()
                .loginId(loginId)
                .passwordHash(passwordEncoder.encode(password))
                .name(name)
                .role(role)
                .active(true)
                .build();

        userRepository.save(user);
        System.out.println(">>> " + loginId + " 계정 생성 완료");
    }

    private void seedScoreTablesIfMissing(String tableId) {
        if (scoreTableRepository.existsByTableId(tableId)) {
            return;
        }

        for (int module1Correct = 19; module1Correct <= 27; module1Correct++) {
            for (int module2Correct = 1; module2Correct <= 27; module2Correct++) {
                int totalCorrect = module1Correct + module2Correct;
                int sectionScore = Math.min(800, 260 + (10 * totalCorrect));
                scoreTableRepository.save(
                        ScoreTable.create(
                                tableId,
                                RouteType.UPPER,
                                module1Correct,
                                module2Correct,
                                totalCorrect,
                                sectionScore
                        )
                );
            }
        }

        for (int module1Correct = 1; module1Correct <= 18; module1Correct++) {
            for (int module2Correct = 1; module2Correct <= 27; module2Correct++) {
                int totalCorrect = module1Correct + module2Correct;
                int sectionScore = Math.min(630, 200 + (10 * totalCorrect));
                scoreTableRepository.save(
                        ScoreTable.create(
                                tableId,
                                RouteType.LOWER,
                                module1Correct,
                                module2Correct,
                                totalCorrect,
                                sectionScore
                        )
                );
            }
        }

        System.out.println(">>> score table seed 완료: " + tableId);
    }
}
