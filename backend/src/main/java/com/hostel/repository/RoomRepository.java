package com.hostel.repository;

import com.hostel.entity.Room;
import com.hostel.enums.HostelType;
import com.hostel.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHostelId(Long hostelId);
    List<Room> findByHostelIdAndStatus(Long hostelId, RoomStatus status);
    List<Room> findByHostelIdAndFloorNumber(Long hostelId, Integer floorNumber);
    List<Room> findByRoomTypeId(Long roomTypeId);
    List<Room> findByHostelHostelType(HostelType hostelType);
    java.util.Optional<Room> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
    
    List<Room> findByHostelHostelTypeAndStatusAndRoomTypeCapacityGreaterThanEqual(HostelType hostelType, RoomStatus status, Integer capacity);
    
    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' AND (r.roomType.capacity - r.occupiedBeds) >= :requiredBeds AND r.hostel.hostelType = :hostelType")
    List<Room> findAvailableRooms(@Param("requiredBeds") Integer requiredBeds, @Param("hostelType") HostelType hostelType);
}
