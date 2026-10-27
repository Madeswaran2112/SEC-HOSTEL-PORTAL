package com.hostel.entity;

import com.hostel.enums.AllocationWindowStatus;
import com.hostel.enums.PhaseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Entity
@Table(name = "allocation_windows")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationWindow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String academicYear;

    @Column(nullable = false)
    private String semester;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AllocationWindowStatus status = AllocationWindowStatus.UPCOMING;

    // Phase 1: Room Type Preference
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PhaseStatus phase1Status = PhaseStatus.NOT_OPEN;

    @Column
    private LocalDateTime phase1StartDate;

    @Column
    private LocalDateTime phase1EndDate;

    @Column(length = 500)
    private String phase1Description;

    // Phase 2: Room and Roommate Selection
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PhaseStatus phase2Status = PhaseStatus.NOT_OPEN;

    @Column
    private LocalDateTime phase2StartDate;

    @Column
    private LocalDateTime phase2EndDate;

    @Column(length = 500)
    private String phase2Description;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /**
     * Server-side Asia/Kolkata timezone schedule validation for Phase 1
     */
    public PhaseStatus getEffectivePhase1Status() {
        if (phase1Status == PhaseStatus.CLOSED) {
            return PhaseStatus.CLOSED;
        }
        ZonedDateTime nowKolkata = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
        LocalDateTime now = nowKolkata.toLocalDateTime();
        if (phase1StartDate != null && now.isBefore(phase1StartDate)) {
            return PhaseStatus.NOT_OPEN;
        }
        if (phase1EndDate != null && now.isAfter(phase1EndDate)) {
            return PhaseStatus.CLOSED;
        }
        return phase1Status != null ? phase1Status : PhaseStatus.NOT_OPEN;
    }

    /**
     * Server-side Asia/Kolkata timezone schedule validation for Phase 2
     */
    public PhaseStatus getEffectivePhase2Status() {
        if (phase2Status == PhaseStatus.CLOSED) {
            return PhaseStatus.CLOSED;
        }
        ZonedDateTime nowKolkata = ZonedDateTime.now(ZoneId.of("Asia/Kolkata"));
        LocalDateTime now = nowKolkata.toLocalDateTime();
        if (phase2StartDate != null && now.isBefore(phase2StartDate)) {
            return PhaseStatus.NOT_OPEN;
        }
        if (phase2EndDate != null && now.isAfter(phase2EndDate)) {
            return PhaseStatus.CLOSED;
        }
        return phase2Status != null ? phase2Status : PhaseStatus.NOT_OPEN;
    }
}
