package com.hostel.dto.response;

import com.hostel.enums.AllocationStatus;
import com.hostel.enums.AllocationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private Long roomId;
    private String roomNumber;
    private String hostelName;
    private String roomTypeName;
    private Integer floorNumber;
    private Integer bedNumber;
    private AllocationStatus status;
    private AllocationType allocationType;
    private Long groupId;
    private String groupName;
    private LocalDateTime allocatedAt;
    private LocalDateTime respondedAt;
}
