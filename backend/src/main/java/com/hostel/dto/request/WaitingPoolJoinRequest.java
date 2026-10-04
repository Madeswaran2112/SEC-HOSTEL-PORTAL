package com.hostel.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WaitingPoolJoinRequest {
    @NotNull(message = "Allocation Window ID is required")
    private Long allocationWindowId;

    private Long preferredRoomTypeId;
}
