package com.hostel.dto.response;

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
public class PhaseTwoBookingResponse {
    private Long roomId;
    private String roomNumber;
    private String building;
    private String hostelName;
    private Integer floorNumber;
    private String roomTypeName;
    private Boolean isAc;
    private Integer totalCapacity;
    private Integer occupiedBeds;
    private Integer availableBeds;
    private List<AllocationResponse> allocations;
    private LocalDateTime bookedAt;
}

