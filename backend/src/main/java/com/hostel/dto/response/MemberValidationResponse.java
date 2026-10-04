package com.hostel.dto.response;

import com.hostel.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberValidationResponse {
    private boolean valid;
    private String message;
    private Long studentId;
    private String name;
    private String registerNumber;
    private String department;
    private Integer year;
    private Gender gender;
}
