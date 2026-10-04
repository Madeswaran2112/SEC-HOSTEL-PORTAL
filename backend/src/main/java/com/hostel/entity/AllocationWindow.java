package com.hostel.entity;

import com.hostel.enums.AllocationWindowStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

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

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
