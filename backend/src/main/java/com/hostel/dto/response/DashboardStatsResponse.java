package com.hostel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalStudents;
    private long totalHostels;
    private long totalRooms;
    private long totalBeds;
    private long availableBeds;
    private long occupiedBeds;
    private long availableRooms;
    private long pendingApplications;
    private long approvedApplications;
    private long readyGroups;
    private long allocatedStudents;
    private long totalGroups;
    private long totalAllocations;
    private double occupancyPercentage;
}