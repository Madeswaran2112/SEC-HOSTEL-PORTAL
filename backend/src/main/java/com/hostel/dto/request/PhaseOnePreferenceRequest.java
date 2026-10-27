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
public class PhaseOnePreferenceRequest {
    @NotNull(message = "Preferred room type ID is required")
    private Long preferredRoomTypeId;

    @NotNull(message = "AC preference is required")
    private Boolean isAc;
}
