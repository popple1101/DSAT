package com.dsat.lms.domain.user.service;

import com.dsat.lms.domain.user.dto.AuthResponse;
import com.dsat.lms.domain.user.dto.LoginRequest;
import com.dsat.lms.domain.user.dto.SignupRequest;
import com.dsat.lms.domain.user.entity.User;
import com.dsat.lms.domain.user.repository.UserRepository;
import com.dsat.lms.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.findByLoginId(request.loginId()).isPresent()) {
            throw new IllegalArgumentException("이미 사용 중인 로그인 아이디입니다.");
        }

        String encodedPassword = passwordEncoder.encode(request.password());

        User user = User.createStudent(
                request.loginId(),
                encodedPassword,
                request.name()
        );

        User savedUser = userRepository.save(user);

        String accessToken = jwtProvider.generateToken(
                savedUser.getId(),
                savedUser.getLoginId(),
                savedUser.getRole().name()
        );

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getLoginId(),
                savedUser.getName(),
                savedUser.getRole().name(),
                accessToken
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByLoginId(request.loginId())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다."));

        if (!user.isActive()) {
            throw new IllegalArgumentException("비활성화된 계정입니다.");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken = jwtProvider.generateToken(
                user.getId(),
                user.getLoginId(),
                user.getRole().name()
        );

        return new AuthResponse(
                user.getId(),
                user.getLoginId(),
                user.getName(),
                user.getRole().name(),
                accessToken
        );
    }
}