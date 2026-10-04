package com.hostel.entity;

import com.hostel.enums.GroupStatus;
import com.hostel.enums.HostelType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "student_groups")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String groupName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private StudentProfile leader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "preferred_room_type_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private RoomType preferredRoomType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HostelType hostelTypePreference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GroupStatus status = GroupStatus.FORMING;

    @Column(nullable = false)
    private Integer maxSize;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<GroupMembership> members;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
