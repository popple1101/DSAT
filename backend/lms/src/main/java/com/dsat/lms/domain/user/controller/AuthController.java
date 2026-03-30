package com.dsat.lms.domain.user.controller;

import com.dsat.lms.domain.user.dto.AuthResponse;
import com.dsat.lms.domain.user.dto.LoginRequest;
import com.dsat.lms.domain.user.dto.SignupRequest;
import com.dsat.lms.domain.user.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
        return authService.signup(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}