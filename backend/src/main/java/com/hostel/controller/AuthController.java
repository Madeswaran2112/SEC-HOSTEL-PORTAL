package com.hostel.controller;

import com.hostel.dto.request.LoginRequest;
import com.hostel.dto.request.RegisterRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.AuthResponse;
import com.hostel.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(ApiResponse.success("Registration successful", response), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestParam String token) {
        AuthResponse response = authService.refreshToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<com.hostel.dto.response.StudentResponse>> getCurrentUser(
            @com.hostel.security.CurrentUser org.springframework.security.core.userdetails.UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthenticated"));
        }
        com.hostel.dto.response.StudentResponse response = authService.getCurrentUser(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Current user retrieved", response));
    }
}
