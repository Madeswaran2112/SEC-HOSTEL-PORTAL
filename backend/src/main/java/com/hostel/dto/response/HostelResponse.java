package com.hostel.dto.response;

import com.hostel.enums.HostelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HostelResponse {
    private Long id;
    private String name;
    private HostelType hostelType;
    private String address;
    private Integer totalFloors;
    private Boolean isActive;
    private Integer totalRooms;
    private Integer availableRooms;
    private Integer totalBeds;
    private Integer occupiedBeds;
    private Integer availableBeds;
    private Double occupancyRate;
}