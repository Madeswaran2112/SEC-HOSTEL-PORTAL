package com.hostel.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RoomTypeRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 10, message = "Capacity cannot exceed 10")
    private Integer capacity;

    @NotNull(message = "AC specification is required")
    private Boolean isAc;

    private BigDecimal baseFee;
}
