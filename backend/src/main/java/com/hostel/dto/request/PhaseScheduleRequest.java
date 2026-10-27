package com.hostel.dto.request;

import com.hostel.enums.PhaseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhaseScheduleRequest {
    @NotNull(message = "Phase number (1 or 2) is required")
    private Integer phase;

    private String academicYear;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private PhaseStatus status;
    private String description;
}
