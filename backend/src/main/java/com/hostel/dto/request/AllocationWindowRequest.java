package com.hostel.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AllocationWindowRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotBlank(message = "Semester is required")
    private String semester;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    @Future(message = "End date must be in the future")
    private LocalDateTime endDate;
}
