package com.hostel.service;

import com.hostel.dto.request.LoginRequest;
import com.hostel.dto.request.RegisterRequest;
import com.hostel.dto.response.AuthResponse;
import com.hostel.dto.response.StudentResponse;
import com.hostel.entity.StudentProfile;
import com.hostel.entity.User;
import com.hostel.enums.Role;
import com.hostel.enums.StudentAllocationStatus;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.UnauthorizedException;
import com.hostel.mapper.StudentMapper;
import com.hostel.repository.StudentProfileRepository;
import com.hostel.repository.UserRepository;
import com.hostel.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() != null && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use");
        }
        if (studentProfileRepository.existsByRegisterNumber(request.getRegisterNumber())) {
            throw new DuplicateResourceException("Register number already exists");
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .isActive(true)
                .emailVerified(true)
                .verificationToken(UUID.randomUUID().toString())
                .build();

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .name(request.getName())
                .registerNumber(request.getRegisterNumber())
                .department(request.getDepartment())
                .year(request.getYear())
                .phone(request.getPhone())
                .gender(request.getGender())
                .allocationStatus(StudentAllocationStatus.NOT_APPLIED)
                .build();

        user.setStudentProfile(profile);
        userRepository.save(user);

        // Normally we would send an email here with the verification token

        return generateAuthResponse(user, profile);
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail() != null ? request.getEmail().trim() : "";
        User user = resolveUser(identifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        if (!user.getIsActive()) {
            throw new UnauthorizedException("Account is disabled");
        }

        return generateAuthResponse(user, user.getStudentProfile());
    }

    private java.util.Optional<User> resolveUser(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return java.util.Optional.empty();
        }

        java.util.Optional<User> byEmail = userRepository.findByEmailIgnoreCase(identifier);
        if (byEmail.isPresent()) {
            return byEmail;
        }

        java.util.Optional<User> byRegNo = studentProfileRepository.findByRegisterNumberIgnoreCase(identifier)
                .map(com.hostel.entity.StudentProfile::getUser);
        if (byRegNo.isPresent()) {
            return byRegNo;
        }

        if (!identifier.contains("@")) {
            java.util.Optional<User> byHostelDomain = userRepository.findByEmailIgnoreCase(identifier + "@hostel.com");
            if (byHostelDomain.isPresent()) {
                return byHostelDomain;
            }
            java.util.Optional<User> byPrefix = userRepository.findByEmailStartingWithIgnoreCase(identifier + "@");
            if (byPrefix.isPresent()) {
                return byPrefix;
            }
        }

        return java.util.Optional.empty();
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (tokenProvider.validateToken(refreshToken)) {
            String email = tokenProvider.getUsernameFromToken(refreshToken);
            
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            String newAccessToken = tokenProvider.generateAccessToken(userDetails);
            String newRefreshToken = tokenProvider.generateRefreshToken(userDetails); // Optional: rotate refresh token

            AuthResponse authResponse = generateAuthResponse(user, user.getStudentProfile());
            authResponse.setAccessToken(newAccessToken);
            authResponse.setRefreshToken(newRefreshToken);
            
            return authResponse;
        }
        throw new UnauthorizedException("Invalid refresh token");
    }

    @Transactional
    public void verifyEmail(String token) {
        // Find user by verification token, set emailVerified = true, clear token
    }

    public StudentResponse getCurrentUser(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return StudentMapper.toResponse(user.getStudentProfile(), user);
    }

    private AuthResponse generateAuthResponse(User user, StudentProfile profile) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + user.getRole().name())
                .build();

        String accessToken = tokenProvider.generateAccessToken(userDetails);
        String refreshToken = tokenProvider.generateRefreshToken(userDetails);

        StudentResponse studentResponse = StudentMapper.toResponse(profile, user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(studentResponse)
                .build();
    }
}

