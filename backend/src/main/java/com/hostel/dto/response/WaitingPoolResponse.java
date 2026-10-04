package com.hostel.dto.response;

import com.hostel.enums.HostelType;
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
    private RoomTypeResponse preferredRoomType;
    private HostelType hostelTypePreference;
    private Integer priority;
    private LocalDateTime joinedAt;
    private com.hostel.enums.ApplicationStatus status;
}
