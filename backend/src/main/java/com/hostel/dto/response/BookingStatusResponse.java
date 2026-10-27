package com.hostel.dto.response;

import com.hostel.enums.PhaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusResponse {
    private AllocationWindowResponse window;
    private PhaseStatus phase1Status;
    private PhaseStatus effectivePhase1Status;
    private LocalDateTime phase1StartDate;
    private LocalDateTime phase1EndDate;
    private String phase1Description;

    private PhaseStatus phase2Status;
    private PhaseStatus effectivePhase2Status;
    private LocalDateTime phase2StartDate;
    private LocalDateTime phase2EndDate;
    private String phase2Description;

    private LocalDateTime serverTime;

    private boolean hasSubmittedPhase1;
    private PhaseOnePreferenceResponse phase1Preference;
    private boolean hasBookedPhase2;
    private AllocationResponse allocation;
    private List<AllocationResponse> roommates;

    // Active Waiting List entry or offer
    private WaitingPoolResponse waitlistEntry;
}
