package com.hostel.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Register Number or Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
