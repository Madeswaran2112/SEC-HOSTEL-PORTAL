package com.hostel.security;

import com.hostel.entity.User;
import com.hostel.repository.StudentProfileRepository;
import com.hostel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        String cleanId = identifier != null ? identifier.trim() : "";
        User user = resolveUser(cleanId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + cleanId));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())))
                .accountExpired(false)
                .accountLocked(!user.getIsActive())
                .credentialsExpired(false)
                .disabled(!user.getIsActive())
                .build();
    }

    private Optional<User> resolveUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        // 1. Exact or case-insensitive email match
        Optional<User> byEmail = userRepository.findByEmailIgnoreCase(identifier);
        if (byEmail.isPresent()) {
            return byEmail;
        }

        // 2. Student register number match (case-insensitive)
        Optional<User> byRegNo = studentProfileRepository.findByRegisterNumberIgnoreCase(identifier)
                .map(com.hostel.entity.StudentProfile::getUser);
        if (byRegNo.isPresent()) {
            return byRegNo;
        }

        // 3. Username prefix match without '@' (e.g., "admin", "superadmin")
        if (!identifier.contains("@")) {
            Optional<User> byHostelDomain = userRepository.findByEmailIgnoreCase(identifier + "@hostel.com");
            if (byHostelDomain.isPresent()) {
                return byHostelDomain;
            }
            Optional<User> byPrefix = userRepository.findByEmailStartingWithIgnoreCase(identifier + "@");
            if (byPrefix.isPresent()) {
                return byPrefix;
            }
        }

        return Optional.empty();
    }
}
