package com.dsat.lms.domain.user.repository;

import com.dsat.lms.domain.user.entity.User;
import com.dsat.lms.domain.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLoginId(String loginId);
    List<User> findAllByRoleOrderByIdAsc(UserRole role);
}
