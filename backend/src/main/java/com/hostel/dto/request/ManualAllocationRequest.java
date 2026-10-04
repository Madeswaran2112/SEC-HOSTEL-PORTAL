package com.hostel.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ManualAllocationRequest {
    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Room ID is required")
    private Long roomId;

    @NotNull(message = "Bed number is required")
    @Min(value = 1, message = "Bed number must be at least 1")
    private Integer bedNumber;
}
