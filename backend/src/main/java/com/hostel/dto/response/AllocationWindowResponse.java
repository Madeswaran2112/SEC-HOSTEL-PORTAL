package com.hostel.dto.response;

import com.hostel.enums.AllocationWindowStatus;
import com.hostel.enums.PhaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationWindowResponse {
    private Long id;
    private String name;
    private String academicYear;
    private String semester;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private AllocationWindowStatus status;

    // Phase 1
    private PhaseStatus phase1Status;
    private PhaseStatus effectivePhase1Status;
    private LocalDateTime phase1StartDate;
    private LocalDateTime phase1EndDate;
    private String phase1Description;

    // Phase 2
    private PhaseStatus phase2Status;
    private PhaseStatus effectivePhase2Status;
    private LocalDateTime phase2StartDate;
    private LocalDateTime phase2EndDate;
    private String phase2Description;

    // Server time in Asia/Kolkata
    private LocalDateTime serverTime;

    private LocalDateTime createdAt;
}
