package com.hostel.repository;

import com.hostel.entity.Room;
import com.hostel.enums.HostelType;
import com.hostel.enums.RoomStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHostelId(Long hostelId);
    List<Room> findByHostelIdAndStatus(Long hostelId, RoomStatus status);
    List<Room> findByHostelIdAndFloorNumber(Long hostelId, Integer floorNumber);
    List<Room> findByRoomTypeId(Long roomTypeId);
    List<Room> findByHostelHostelType(HostelType hostelType);
    Optional<Room> findByHostelIdAndRoomNumber(Long hostelId, String roomNumber);
    
    List<Room> findByHostelHostelTypeAndStatus(HostelType hostelType, RoomStatus status);

    List<Room> findByHostelHostelTypeAndStatusAndRoomTypeCapacityGreaterThanEqual(HostelType hostelType, RoomStatus status, Integer capacity);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdWithLock(@Param("id") Long id);

    @Query("SELECT r FROM Room r WHERE r.status = 'AVAILABLE' AND (r.roomType.capacity - r.occupiedBeds) >= :requiredBeds AND r.hostel.hostelType = :hostelType")
    List<Room> findAvailableRooms(@Param("requiredBeds") Integer requiredBeds, @Param("hostelType") HostelType hostelType);
}
