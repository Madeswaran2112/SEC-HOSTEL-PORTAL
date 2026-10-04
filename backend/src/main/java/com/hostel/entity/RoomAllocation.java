package com.hostel.entity;

import com.hostel.enums.AllocationStatus;
import com.hostel.enums.AllocationType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "room_allocations", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "allocation_window_id"}),
        @UniqueConstraint(columnNames = {"room_id", "bed_number", "allocation_window_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "allocation_window_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private AllocationWindow allocationWindow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudentGroup group;

    @Column(name = "bed_number", nullable = false)
    private Integer bedNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private AllocationStatus status = AllocationStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationType allocationType;

    @Column(nullable = false)
    private LocalDateTime allocatedAt;

    private LocalDateTime respondedAt;
}
