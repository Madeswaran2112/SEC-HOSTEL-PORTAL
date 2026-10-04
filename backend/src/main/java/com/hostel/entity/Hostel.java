package com.hostel.entity;

import com.hostel.enums.HostelType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "hostels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hostel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HostelType hostelType;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private Integer totalFloors;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "hostel", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Room> rooms;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
