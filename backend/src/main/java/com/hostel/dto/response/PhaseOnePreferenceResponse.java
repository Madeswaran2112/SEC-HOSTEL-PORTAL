package com.hostel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhaseOnePreferenceResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private Long allocationWindowId;
    private String windowName;
    private Long preferredRoomTypeId;
    private String preferredRoomTypeName;
    private Integer capacity;
    private Boolean isAc;
    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;
}

