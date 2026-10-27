package com.hostel.dto.response;

import com.hostel.enums.PhaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusResponse {
    private AllocationWindowResponse window;
    private PhaseStatus phase1Status;
    private PhaseStatus phase2Status;
    private boolean hasSubmittedPhase1;
    private PhaseOnePreferenceResponse phase1Preference;
    private boolean hasBookedPhase2;
    private AllocationResponse allocation;
    private List<AllocationResponse> roommates;
}
