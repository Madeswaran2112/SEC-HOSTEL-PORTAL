package com.hostel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateRoommateResponse {
    private boolean valid;
    private Long studentId;
    private String name;
    private String registerNumber;
    private String department;
    private Integer year;
    private String gender;
    private String message;
}
