package com.hostel.dto.response;

import com.hostel.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private Long id;
    private Long hostelId;
    private String hostelName;
    private Long roomTypeId;
    private String roomTypeName;
    private String roomNumber;
    private Integer floorNumber;
    private RoomStatus status;
    private Integer capacity;
    private Integer occupiedBeds;
    private Integer availableBeds;
}
