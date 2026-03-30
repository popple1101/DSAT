package com.dsat.lms.global.config;

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
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUserIfMissing("superadmin", "1234", "최고관리자", UserRole.SUPER_ADMIN);
        createUserIfMissing("manager", "1234", "운영관리자", UserRole.ADMIN_MANAGER);
        createUserIfMissing("teacher", "1234", "강사관리자", UserRole.ADMIN_TEACHER);
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
}
