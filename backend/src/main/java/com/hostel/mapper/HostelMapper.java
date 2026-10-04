package com.hostel.mapper;

import com.hostel.dto.request.HostelRequest;
import com.hostel.dto.response.HostelResponse;
import com.hostel.entity.Hostel;

public class HostelMapper {

    public static HostelResponse toResponse(Hostel hostel) {
        if (hostel == null) {
            return null;
        }

        int totalRooms = hostel.getRooms() != null ? hostel.getRooms().size() : 0;
        int availableRooms = hostel.getRooms() != null ? 
            (int) hostel.getRooms().stream().filter(r -> "AVAILABLE".equals(r.getStatus().name())).count() : 0;

        int totalBeds = hostel.getRooms() != null ?
            hostel.getRooms().stream().mapToInt(r -> r.getRoomType() != null && r.getRoomType().getCapacity() != null ? r.getRoomType().getCapacity() : 0).sum() : 0;

        int occupiedBeds = hostel.getRooms() != null ?
            hostel.getRooms().stream().mapToInt(r -> r.getOccupiedBeds() != null ? r.getOccupiedBeds() : 0).sum() : 0;

        int availableBeds = Math.max(0, totalBeds - occupiedBeds);
        double occupancyRate = totalBeds > 0 ? Math.round(((double) occupiedBeds / totalBeds) * 100.0) : 0.0;

        return HostelResponse.builder()
                .id(hostel.getId())
                .name(hostel.getName())
                .hostelType(hostel.getHostelType())
                .address(hostel.getAddress())
                .totalFloors(hostel.getTotalFloors())
                .isActive(hostel.getIsActive())
                .totalRooms(totalRooms)
                .availableRooms(availableRooms)
                .totalBeds(totalBeds)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .occupancyRate(occupancyRate)
                .build();
    }

    public static Hostel toEntity(HostelRequest request) {
        if (request == null) {
            return null;
        }

        return Hostel.builder()
                .name(request.getName())
                .hostelType(request.getHostelType())
                .address(request.getAddress())
                .totalFloors(request.getTotalFloors())
                .build();
    }
}