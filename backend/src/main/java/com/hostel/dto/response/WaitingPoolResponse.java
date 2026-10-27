package com.hostel.dto.response;

import com.hostel.enums.HostelType;
import com.hostel.enums.WaitlistStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WaitingPoolResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private String department;
    private Integer year;
    private RoomTypeResponse preferredRoomType;
    private Boolean isAc;
    private Integer groupSize;
    private String floorPreference;
    private String reason;
    private HostelType hostelTypePreference;
    private Integer priority;
    private Integer queuePosition;
    private LocalDateTime joinedAt;
    private WaitlistStatus status;

    // Offer details
    private Long offeredRoomId;
    private String offeredRoomNumber;
    private String offeredRoomTypeName;
    private String offeredRoomBuilding;
    private Integer offeredRoomFloor;
    private LocalDateTime offeredAt;
    private LocalDateTime offerExpiresAt;

    private String adminNotes;
}
