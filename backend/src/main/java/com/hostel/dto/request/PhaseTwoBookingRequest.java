package com.hostel.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhaseTwoBookingRequest {
    @NotNull(message = "Room ID is required")
    private Long roomId;

    private List<String> roommateRegisterNumbers;
}
