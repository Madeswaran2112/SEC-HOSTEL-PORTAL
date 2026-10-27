package com.hostel.mapper;

import com.hostel.dto.request.RoomRequest;
import com.hostel.dto.response.RoomResponse;
import com.hostel.entity.Hostel;
import com.hostel.entity.Room;
import com.hostel.entity.RoomType;

public class RoomMapper {

    public static RoomResponse toResponse(Room room) {
        if (room == null) {
            return null;
        }

        int capacity = room.getEffectiveCapacity();
        int occupiedBeds = room.getOccupiedBeds() != null ? room.getOccupiedBeds() : 0;
        int availableBeds = room.getAvailableBeds();

        return RoomResponse.builder()
                .id(room.getId())
                .hostelId(room.getHostel() != null ? room.getHostel().getId() : null)
                .hostelName(room.getHostel() != null ? room.getHostel().getName() : null)
                .roomTypeId(room.getRoomType() != null ? room.getRoomType().getId() : null)
                .roomTypeName(room.getRoomType() != null ? room.getRoomType().getName() : null)
                .isAc(room.getRoomType() != null ? room.getRoomType().getIsAc() : false)
                .building(room.getBuilding() != null ? room.getBuilding() : "Main Block")
                .roomNumber(room.getRoomNumber())
                .floorNumber(room.getFloorNumber())
                .status(room.getStatus())
                .capacity(capacity)
                .totalCapacity(room.getTotalCapacity() != null ? room.getTotalCapacity() : capacity)
                .occupiedBeds(occupiedBeds)
                .availableBeds(availableBeds)
                .build();
    }

    public static Room toEntity(RoomRequest request, Hostel hostel, RoomType roomType) {
        if (request == null) {
            return null;
        }

        return Room.builder()
                .hostel(hostel)
                .roomType(roomType)
                .roomNumber(request.getRoomNumber())
                .building(request.getBuilding() != null ? request.getBuilding() : "Main Block")
                .floorNumber(request.getFloorNumber())
                .totalCapacity(request.getTotalCapacity() != null && request.getTotalCapacity() > 0 ? request.getTotalCapacity() : roomType.getCapacity())
                .build();
    }
}
