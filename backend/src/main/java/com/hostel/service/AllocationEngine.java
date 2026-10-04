package com.hostel.service;

import com.hostel.entity.*;
import com.hostel.enums.*;
import com.hostel.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationEngine {

    private static final Logger logger = LoggerFactory.getLogger(AllocationEngine.class);

    private final StudentGroupRepository groupRepository;
    private final GroupMembershipRepository membershipRepository;
    private final WaitingPoolRepository waitingPoolRepository;
    private final RoomRepository roomRepository;
    private final RoomAllocationRepository allocationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> runAutoAllocation(AllocationWindow window) {
        logger.info("Starting auto-allocation for window: {}", window.getName());
        int allocatedCount = 0;
        
        // Phase 1: Complete Groups
        allocatedCount += allocateCompleteGroups(window);
        
        // Phase 2: Partial Groups
        allocatedCount += allocatePartialGroups(window);
        
        // Phase 3: Individuals from Waiting Pool
        allocatedCount += allocateIndividuals(window);
        
        logger.info("Auto-allocation complete. Total allocated: {}", allocatedCount);
        return Map.of("totalAllocated", allocatedCount);
    }

    private int allocateCompleteGroups(AllocationWindow window) {
        List<StudentGroup> completeGroups = groupRepository.findByStatus(GroupStatus.COMPLETE);
        int count = 0;

        for (StudentGroup group : completeGroups) {
            List<GroupMembership> members = membershipRepository.findByGroupIdAndStatus(group.getId(), MembershipStatus.ACCEPTED);
            int groupSize = members.size();

            // Find an empty room matching capacity and preferences
            List<Room> availableRooms = roomRepository.findAvailableRooms(groupSize, group.getHostelTypePreference());
            
            // Filter further by preferred room type if present, or just take first available
            Optional<Room> selectedRoomOpt = availableRooms.stream()
                    .filter(r -> group.getPreferredRoomType() == null || r.getRoomType().getId().equals(group.getPreferredRoomType().getId()))
                    .filter(r -> r.getOccupiedBeds() == 0 && r.getRoomType().getCapacity() == groupSize)
                    .findFirst();

            if (selectedRoomOpt.isPresent()) {
                Room room = selectedRoomOpt.get();
                allocateGroupToRoom(members, room, group, window, AllocationType.AUTO);
                count += members.size();
                group.setStatus(GroupStatus.ALLOCATED);
                groupRepository.save(group);
            }
        }
        return count;
    }

    private int allocatePartialGroups(AllocationWindow window) {
        List<StudentGroup> partialGroups = groupRepository.findByStatus(GroupStatus.PARTIAL);
        int count = 0;

        for (StudentGroup group : partialGroups) {
            List<GroupMembership> members = membershipRepository.findByGroupIdAndStatus(group.getId(), MembershipStatus.ACCEPTED);
            int groupSize = members.size();

            List<Room> availableRooms = roomRepository.findAvailableRooms(groupSize, group.getHostelTypePreference());
            
            Optional<Room> selectedRoomOpt = availableRooms.stream()
                    .filter(r -> group.getPreferredRoomType() == null || r.getRoomType().getId().equals(group.getPreferredRoomType().getId()))
                    .findFirst();
                    
            if (selectedRoomOpt.isEmpty() && !availableRooms.isEmpty()) {
                selectedRoomOpt = Optional.of(availableRooms.get(0)); // Fallback to any room
            }

            if (selectedRoomOpt.isPresent()) {
                Room room = selectedRoomOpt.get();
                allocateGroupToRoom(members, room, group, window, AllocationType.AUTO);
                count += members.size();
                group.setStatus(GroupStatus.ALLOCATED);
                groupRepository.save(group);
            }
        }
        return count;
    }

    private int allocateIndividuals(AllocationWindow window) {
        List<WaitingPool> pool = waitingPoolRepository.findByAllocationWindowIdOrderByPriorityDescJoinedAtAsc(window.getId());
        int count = 0;

        for (WaitingPool entry : pool) {
            StudentProfile student = entry.getStudent();
            // Check if already allocated (in case they were part of a group)
            if (allocationRepository.existsByStudentIdAndAllocationWindowId(student.getId(), window.getId())) {
                continue;
            }

            List<Room> availableRooms = roomRepository.findAvailableRooms(1, entry.getHostelTypePreference());
            
            Optional<Room> selectedRoomOpt = availableRooms.stream()
                    .filter(r -> entry.getPreferredRoomType() == null || r.getRoomType().getId().equals(entry.getPreferredRoomType().getId()))
                    .findFirst();
                    
            if (selectedRoomOpt.isEmpty() && !availableRooms.isEmpty()) {
                selectedRoomOpt = Optional.of(availableRooms.get(0));
            }

            if (selectedRoomOpt.isPresent()) {
                Room room = selectedRoomOpt.get();
                int bedNumber = getNextAvailableBed(room, window);
                
                createAllocation(student, room, bedNumber, null, window, AllocationType.AUTO);
                
                room.setOccupiedBeds(room.getOccupiedBeds() + 1);
                if (room.getOccupiedBeds() >= room.getRoomType().getCapacity()) {
                    room.setStatus(RoomStatus.FULL);
                }
                roomRepository.save(room);
                
                count++;
            }
        }
        return count;
    }

    private void allocateGroupToRoom(List<GroupMembership> members, Room room, StudentGroup group, AllocationWindow window, AllocationType type) {
        List<Integer> availableBeds = getAvailableBedsList(room, window, members.size());
        
        for (int i = 0; i < members.size(); i++) {
            StudentProfile student = members.get(i).getStudent();
            int bedNum = availableBeds.get(i);
            createAllocation(student, room, bedNum, group, window, type);
        }
        
        room.setOccupiedBeds(room.getOccupiedBeds() + members.size());
        if (room.getOccupiedBeds() >= room.getRoomType().getCapacity()) {
            room.setStatus(RoomStatus.FULL);
        }
        roomRepository.save(room);
    }

    private int getNextAvailableBed(Room room, AllocationWindow window) {
        List<RoomAllocation> existing = allocationRepository.findByRoomId(room.getId()).stream()
                .filter(a -> a.getAllocationWindow().getId().equals(window.getId()))
                .filter(a -> a.getStatus() != AllocationStatus.CANCELLED && a.getStatus() != AllocationStatus.REJECTED)
                .collect(Collectors.toList());
                
        for (int i = 1; i <= room.getRoomType().getCapacity(); i++) {
            final int bedNum = i;
            if (existing.stream().noneMatch(a -> a.getBedNumber() == bedNum)) {
                return bedNum;
            }
        }
        return -1;
    }

    private List<Integer> getAvailableBedsList(Room room, AllocationWindow window, int count) {
        List<Integer> beds = new ArrayList<>();
        List<RoomAllocation> existing = allocationRepository.findByRoomId(room.getId()).stream()
                .filter(a -> a.getAllocationWindow().getId().equals(window.getId()))
                .filter(a -> a.getStatus() != AllocationStatus.CANCELLED && a.getStatus() != AllocationStatus.REJECTED)
                .collect(Collectors.toList());
                
        for (int i = 1; i <= room.getRoomType().getCapacity() && beds.size() < count; i++) {
            final int bedNum = i;
            if (existing.stream().noneMatch(a -> a.getBedNumber() == bedNum)) {
                beds.add(bedNum);
            }
        }
        return beds;
    }

    private void createAllocation(StudentProfile student, Room room, int bedNumber, StudentGroup group, AllocationWindow window, AllocationType type) {
        RoomAllocation allocation = RoomAllocation.builder()
                .student(student)
                .room(room)
                .allocationWindow(window)
                .group(group)
                .bedNumber(bedNumber)
                .status(AllocationStatus.PENDING)
                .allocationType(type)
                .allocatedAt(LocalDateTime.now())
                .build();
                
        allocationRepository.save(allocation);
        
        student.setAllocationStatus(StudentAllocationStatus.ALLOCATED);
        studentProfileRepository.save(student);

        // Notify student
        notificationService.createNotification(
                student.getUser().getId(),
                "Room Allocated",
                "You have been allocated Room " + room.getRoomNumber() + " in " + room.getHostel().getName() + ". Please review and accept/reject.",
                NotificationType.ALLOCATION,
                "ALLOCATION",
                allocation.getId()
        );
    }
}
