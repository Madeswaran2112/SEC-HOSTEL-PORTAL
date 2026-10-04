package com.hostel.service;

import com.hostel.dto.request.ManualAllocationRequest;
import com.hostel.dto.response.AllocationResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.entity.*;
import com.hostel.enums.*;
import com.hostel.exception.AllocationConflictException;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.exception.UnauthorizedException;
import com.hostel.mapper.AllocationMapper;
import com.hostel.repository.*;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final RoomAllocationRepository allocationRepository;
    private final AllocationWindowRepository windowRepository;
    private final AllocationEngine allocationEngine;
    private final RoomRepository roomRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final WaitingPoolRepository waitingPoolRepository;

    @Transactional
    public Map<String, Object> runAutoAllocation(Long windowId) {
        AllocationWindow window = windowRepository.findById(windowId)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", windowId));
                
        if (window.getStatus() != AllocationWindowStatus.OPEN) {
            throw new BadRequestException("Window must be OPEN to run auto-allocation");
        }

        window.setStatus(AllocationWindowStatus.ALLOCATION_RUNNING);
        windowRepository.save(window);

        Map<String, Object> results = allocationEngine.runAutoAllocation(window);
        
        window.setStatus(AllocationWindowStatus.COMPLETED);
        windowRepository.save(window);

        return results;
    }

    @Transactional
    public AllocationResponse manualAllocation(Long windowId, ManualAllocationRequest request) {
        AllocationWindow window = windowRepository.findById(windowId)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", windowId));

        if (allocationRepository.existsByStudentIdAndAllocationWindowId(request.getStudentId(), windowId)) {
            throw new AllocationConflictException("Student already has an allocation in this window");
        }
        
        if (allocationRepository.existsByRoomIdAndBedNumberAndAllocationWindowId(request.getRoomId(), request.getBedNumber(), windowId)) {
            throw new AllocationConflictException("Bed is already occupied in this room for this window");
        }

        StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", request.getStudentId()));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", request.getRoomId()));
                
        if (room.getOccupiedBeds() >= room.getRoomType().getCapacity()) {
            throw new BadRequestException("Room is full");
        }
        
        if (request.getBedNumber() > room.getRoomType().getCapacity() || request.getBedNumber() < 1) {
            throw new BadRequestException("Invalid bed number for this room type");
        }
        
        // Gender check
        HostelType expectedHostelType = student.getGender() == Gender.MALE ? HostelType.BOYS : HostelType.GIRLS;
        if (room.getHostel().getHostelType() != expectedHostelType) {
            throw new BadRequestException("Hostel type does not match student gender");
        }

        RoomAllocation allocation = RoomAllocation.builder()
                .student(student)
                .room(room)
                .allocationWindow(window)
                .bedNumber(request.getBedNumber())
                .status(AllocationStatus.ACCEPTED) // Manual allocation bypasses PENDING
                .allocationType(AllocationType.MANUAL)
                .allocatedAt(LocalDateTime.now())
                .respondedAt(LocalDateTime.now())
                .build();
                
        allocation = allocationRepository.save(allocation);
        
        student.setAllocationStatus(StudentAllocationStatus.CONFIRMED);
        studentProfileRepository.save(student);
        
        room.setOccupiedBeds(room.getOccupiedBeds() + 1);
        if (room.getOccupiedBeds() >= room.getRoomType().getCapacity()) {
            room.setStatus(RoomStatus.FULL);
        }
        roomRepository.save(room);
        
        // Notify student
        notificationService.createNotification(
                student.getUser().getId(),
                "Manual Room Allocation",
                "You have been manually allocated to Room " + room.getRoomNumber(),
                NotificationType.ALLOCATION,
                "ALLOCATION",
                allocation.getId()
        );

        return AllocationMapper.toResponse(allocation);
    }

    public PagedResponse<AllocationResponse> getAllocations(Long windowId, AllocationStatus status, Long hostelId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        List<RoomAllocation> allAllocations;
        if (windowId != null) {
            allAllocations = allocationRepository.findByAllocationWindowId(windowId);
        } else {
            allAllocations = allocationRepository.findAll();
        }
        
        List<RoomAllocation> filtered = allAllocations.stream()
                .filter(a -> status == null || a.getStatus() == status)
                .filter(a -> hostelId == null || a.getRoom().getHostel().getId().equals(hostelId))
                .collect(Collectors.toList());
                
        int start = Math.min((int)pageable.getOffset(), filtered.size());
        int end = Math.min((start + pageable.getPageSize()), filtered.size());
        
        Page<RoomAllocation> allocationPage = new PageImpl<>(filtered.subList(start, end), pageable, filtered.size());
        
        List<AllocationResponse> content = allocationPage.getContent().stream()
                .map(AllocationMapper::toResponse)
                .collect(Collectors.toList());
                
        return PaginationUtil.createPagedResponse(allocationPage, content);
    }

    public AllocationResponse getMyAllocation(Long windowId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        RoomAllocation allocation = allocationRepository.findByStudentIdAndAllocationWindowId(student.getId(), windowId)
                .orElseThrow(() -> new ResourceNotFoundException("No allocation found for this window", "windowId", windowId));
                
        return AllocationMapper.toResponse(allocation);
    }

    @Transactional
    public void acceptAllocation(Long id, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        RoomAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoomAllocation", "id", id));
                
        if (!allocation.getStudent().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Cannot accept someone else's allocation");
        }
        
        if (allocation.getStatus() != AllocationStatus.PENDING) {
            throw new BadRequestException("Allocation is already processed");
        }

        allocation.setStatus(AllocationStatus.ACCEPTED);
        allocation.setRespondedAt(LocalDateTime.now());
        allocationRepository.save(allocation);
        
        StudentProfile student = allocation.getStudent();
        student.setAllocationStatus(StudentAllocationStatus.CONFIRMED);
        studentProfileRepository.save(student);
    }

    @Transactional
    public void rejectAllocation(Long id, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        RoomAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoomAllocation", "id", id));
                
        if (!allocation.getStudent().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Cannot reject someone else's allocation");
        }
        
        if (allocation.getStatus() != AllocationStatus.PENDING) {
            throw new BadRequestException("Allocation is already processed");
        }

        allocation.setStatus(AllocationStatus.REJECTED);
        allocation.setRespondedAt(LocalDateTime.now());
        allocationRepository.save(allocation);
        
        StudentProfile student = allocation.getStudent();
        student.setAllocationStatus(StudentAllocationStatus.IN_POOL); // Back to pool
        studentProfileRepository.save(student);
        
        Room room = allocation.getRoom();
        room.setOccupiedBeds(room.getOccupiedBeds() - 1);
        if (room.getStatus() == RoomStatus.FULL) {
            room.setStatus(RoomStatus.AVAILABLE);
        }
        roomRepository.save(room);
        
        // Remove from waiting pool if they were in it previously, wait they should stay in pool but maybe their priority changes
        // For now, let them remain in IN_POOL status for next allocation round
    }

    @Transactional
    public void cancelAllocation(Long id) {
        RoomAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoomAllocation", "id", id));
                
        allocation.setStatus(AllocationStatus.CANCELLED);
        allocationRepository.save(allocation);
        
        StudentProfile student = allocation.getStudent();
        student.setAllocationStatus(StudentAllocationStatus.NOT_APPLIED);
        studentProfileRepository.save(student);
        
        Room room = allocation.getRoom();
        room.setOccupiedBeds(room.getOccupiedBeds() - 1);
        if (room.getStatus() == RoomStatus.FULL) {
            room.setStatus(RoomStatus.AVAILABLE);
        }
        roomRepository.save(room);
        
        notificationService.createNotification(
                student.getUser().getId(),
                "Allocation Cancelled",
                "Your allocation for Room " + room.getRoomNumber() + " has been cancelled by admin",
                NotificationType.ADMIN,
                "ALLOCATION",
                allocation.getId()
        );
    }
}
