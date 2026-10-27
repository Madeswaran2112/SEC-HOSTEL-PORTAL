package com.hostel.entity;

import com.hostel.enums.HostelType;
import com.hostel.enums.WaitlistStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "waiting_pool", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "allocation_window_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitingPool {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocation_window_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AllocationWindow allocationWindow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_room_type_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private RoomType preferredRoomType;

    @Column
    private Boolean isAc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HostelType hostelTypePreference;

    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer groupSize = 1;

    @Column
    private String floorPreference;

    @Column(length = 500)
    private String reason;

    @Column(nullable = false)
    private LocalDateTime joinedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WaitlistStatus status = WaitlistStatus.WAITING;

    // Room Offer Details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offered_room_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Room offeredRoom;

    @Column
    private LocalDateTime offeredAt;

    @Column
    private LocalDateTime offerExpiresAt;

    @Column(length = 1000)
    private String adminNotes;
}
