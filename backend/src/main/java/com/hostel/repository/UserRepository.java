package com.hostel.repository;

import com.hostel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByEmailStartingWithIgnoreCase(String prefix);
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);
}
