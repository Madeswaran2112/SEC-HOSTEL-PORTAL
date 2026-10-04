package com.hostel.dto.response;

import com.hostel.enums.AllocationWindowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllocationWindowResponse {
    private Long id;
    private String name;
    private String academicYear;
    private String semester;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private AllocationWindowStatus status;
    private LocalDateTime createdAt;
}
