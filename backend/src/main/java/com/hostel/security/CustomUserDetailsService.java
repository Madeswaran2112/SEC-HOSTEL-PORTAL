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

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(identifier)
                .orElseGet(() -> studentProfileRepository.findByRegisterNumber(identifier)
                        .map(com.hostel.entity.StudentProfile::getUser)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier)));

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
}
