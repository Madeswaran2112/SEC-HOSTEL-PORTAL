package com.hostel.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitingPoolJoinRequest {
    @NotNull(message = "Allocation Window ID is required")
    private Long allocationWindowId;

    private Long preferredRoomTypeId;
    private Boolean isAc;
    private Integer groupSize;
    private String floorPreference;
    private String reason;
}
