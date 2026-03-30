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
        if (userRepository.findByLoginId("superadmin").isEmpty()) {
            User user = User.builder()
                    .loginId("superadmin")
                    .passwordHash(passwordEncoder.encode("1234"))
                    .name("최고관리자")
                    .role(UserRole.SUPER_ADMIN)
                    .active(true)
                    .build();

            userRepository.save(user);
            System.out.println(">>> superadmin 계정 생성 완료");
        }
    }
}