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

        Integer capacity = room.getRoomType() != null ? room.getRoomType().getCapacity() : 0;
        Integer occupiedBeds = room.getOccupiedBeds() != null ? room.getOccupiedBeds() : 0;

        return RoomResponse.builder()
                .id(room.getId())
                .hostelId(room.getHostel() != null ? room.getHostel().getId() : null)
                .hostelName(room.getHostel() != null ? room.getHostel().getName() : null)
                .roomTypeId(room.getRoomType() != null ? room.getRoomType().getId() : null)
                .roomTypeName(room.getRoomType() != null ? room.getRoomType().getName() : null)
                .roomNumber(room.getRoomNumber())
                .floorNumber(room.getFloorNumber())
                .status(room.getStatus())
                .capacity(capacity)
                .occupiedBeds(occupiedBeds)
                .availableBeds(capacity - occupiedBeds)
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
                .floorNumber(request.getFloorNumber())
                .build();
    }
}
