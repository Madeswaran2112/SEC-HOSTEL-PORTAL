package com.hostel.entity;

import com.hostel.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"hostel_id", "room_number"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hostel_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Hostel hostel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private RoomType roomType;

    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @Column(nullable = false)
    private Integer floorNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoomStatus status = RoomStatus.AVAILABLE;

    @Column(nullable = false)
    @Builder.Default
    private Integer occupiedBeds = 0;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
