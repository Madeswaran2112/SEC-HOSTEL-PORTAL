package com.hostel.mapper;

import com.hostel.dto.response.AllocationResponse;
import com.hostel.entity.RoomAllocation;

public class AllocationMapper {

    public static AllocationResponse toResponse(RoomAllocation allocation) {
        if (allocation == null) {
            return null;
        }

        return AllocationResponse.builder()
                .id(allocation.getId())
                .studentId(allocation.getStudent() != null ? allocation.getStudent().getId() : null)
                .studentName(allocation.getStudent() != null ? allocation.getStudent().getName() : null)
                .registerNumber(allocation.getStudent() != null ? allocation.getStudent().getRegisterNumber() : null)
                .roomId(allocation.getRoom() != null ? allocation.getRoom().getId() : null)
                .roomNumber(allocation.getRoom() != null ? allocation.getRoom().getRoomNumber() : null)
                .hostelName(allocation.getRoom() != null && allocation.getRoom().getHostel() != null ? allocation.getRoom().getHostel().getName() : null)
                .roomTypeName(allocation.getRoom() != null && allocation.getRoom().getRoomType() != null ? allocation.getRoom().getRoomType().getName() : null)
                .floorNumber(allocation.getRoom() != null ? allocation.getRoom().getFloorNumber() : null)
                .bedNumber(allocation.getBedNumber())
                .status(allocation.getStatus())
                .allocationType(allocation.getAllocationType())
                .groupId(allocation.getGroup() != null ? allocation.getGroup().getId() : null)
                .groupName(allocation.getGroup() != null ? allocation.getGroup().getGroupName() : null)
                .allocatedAt(allocation.getAllocatedAt())
                .respondedAt(allocation.getRespondedAt())
                .build();
    }
}
