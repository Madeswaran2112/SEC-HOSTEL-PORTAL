package com.hostel.entity;

import com.hostel.enums.MembershipStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "group_memberships", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"group_id", "student_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMembership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudentGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudentProfile student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MembershipStatus status = MembershipStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime invitedAt;

    private LocalDateTime respondedAt;
}
