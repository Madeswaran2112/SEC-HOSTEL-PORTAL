package com.hostel.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.hostel.enums.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class RegisterRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Register number is required")
    private String registerNumber;

    @Email(message = "Invalid email format")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    private String confirmPassword;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Year is required")
    @Min(value = 1, message = "Year must be at least 1")
    @Max(value = 5, message = "Year cannot exceed 5")
    private Integer year;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Gender is required")
    private Gender gender;
}
