package com.hostel.dto.response;

import com.hostel.enums.Gender;
import com.hostel.enums.StudentAllocationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private Long id;
    private Long userId;
    private String name;
    private String registerNumber;
    private String department;
    private Integer year;
    private String email;
    private String phone;
    private Gender gender;
    private StudentAllocationStatus allocationStatus;
    private String previousRoomNumber;
    private String role;
    private LocalDateTime createdAt;
}
