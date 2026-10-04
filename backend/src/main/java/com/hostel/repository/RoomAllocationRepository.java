package com.hostel.repository;

import com.hostel.entity.RoomAllocation;
import com.hostel.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomAllocationRepository extends JpaRepository<RoomAllocation, Long> {
    List<RoomAllocation> findByStudentId(Long studentId);
    List<RoomAllocation> findByRoomId(Long roomId);
    List<RoomAllocation> findByAllocationWindowId(Long windowId);
    Optional<RoomAllocation> findByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
    List<RoomAllocation> findByAllocationWindowIdAndStatus(Long windowId, AllocationStatus status);
    boolean existsByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
    boolean existsByRoomIdAndBedNumberAndAllocationWindowId(Long roomId, Integer bedNumber, Long windowId);
}
