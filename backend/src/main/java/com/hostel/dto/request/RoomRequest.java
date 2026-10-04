package com.hostel.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoomRequest {
    @NotNull(message = "Hostel ID is required")
    private Long hostelId;

    @NotNull(message = "Room Type ID is required")
    private Long roomTypeId;

    @NotBlank(message = "Room number is required")
    private String roomNumber;

    @NotNull(message = "Floor number is required")
    @Min(value = 0, message = "Floor number must be at least 0")
    private Integer floorNumber;
}
