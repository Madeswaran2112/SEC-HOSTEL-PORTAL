package com.hostel.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class StudentUpdateRequest {
    private String name;
    
    private String department;
    
    @Min(value = 1, message = "Year must be at least 1")
    @Max(value = 5, message = "Year cannot exceed 5")
    private Integer year;
    
    private String phone;
}
