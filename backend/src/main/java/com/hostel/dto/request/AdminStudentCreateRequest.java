package com.hostel.dto.request;

import com.hostel.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStudentCreateRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Register number is required")
    private String registerNumber;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "Academic year is required")
    private Integer year;

    @NotBlank(message = "Phone number is required")
    private String phone;

    @NotNull(message = "Gender is required")
    private Gender gender;

    private String previousRoomNumber;

    private String password;
}

