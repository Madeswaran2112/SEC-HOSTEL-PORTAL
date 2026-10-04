package com.hostel.service;

import com.hostel.dto.request.WaitingPoolJoinRequest;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.RoomTypeResponse;
import com.hostel.dto.response.WaitingPoolResponse;
import com.hostel.entity.*;
import com.hostel.enums.AllocationWindowStatus;
import com.hostel.enums.Gender;
import com.hostel.enums.HostelType;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.*;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WaitingPoolService {

    private final WaitingPoolRepository waitingPoolRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final AllocationWindowRepository windowRepository;
    private final RoomTypeRepository roomTypeRepository;

    @Transactional
    public WaitingPoolResponse joinPool(WaitingPoolJoinRequest request, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        AllocationWindow window = windowRepository.findById(request.getAllocationWindowId())
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", request.getAllocationWindowId()));

        if (window.getStatus() != AllocationWindowStatus.OPEN) {
            throw new BadRequestException("Allocation window is not open");
        }

        if (waitingPoolRepository.existsByStudentIdAndAllocationWindowId(student.getId(), window.getId())) {
            throw new DuplicateResourceException("You are already in the waiting pool for this window");
        }

        RoomType prefType = null;
        if (request.getPreferredRoomTypeId() != null) {
            prefType = roomTypeRepository.findById(request.getPreferredRoomTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", request.getPreferredRoomTypeId()));
        }

        HostelType hostelPref = student.getGender() == Gender.MALE ? HostelType.BOYS : HostelType.GIRLS;

        WaitingPool poolEntry = WaitingPool.builder()
                .student(student)
                .allocationWindow(window)
                .preferredRoomType(prefType)
                .hostelTypePreference(hostelPref)
                .priority(student.getYear()) // Base priority on year (older students higher priority)
                .joinedAt(LocalDateTime.now())
                .build();

        poolEntry = waitingPoolRepository.save(poolEntry);
        
        // Update student status
        student.setAllocationStatus(com.hostel.enums.StudentAllocationStatus.IN_POOL);
        studentProfileRepository.save(student);

        return mapToResponse(poolEntry);
    }

    @Transactional
    public void leavePool(Long windowId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        WaitingPool poolEntry;
        if (windowId != null) {
            poolEntry = waitingPoolRepository.findByStudentIdAndAllocationWindowId(student.getId(), windowId)
                    .orElseThrow(() -> new ResourceNotFoundException("WaitingPool entry not found for this window", "windowId", windowId));
        } else {
            poolEntry = waitingPoolRepository.findAll().stream()
                    .filter(w -> w.getStudent().getId().equals(student.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("WaitingPool entry not found", "studentId", student.getId()));
        }
                
        waitingPoolRepository.delete(poolEntry);
        
        student.setAllocationStatus(com.hostel.enums.StudentAllocationStatus.NOT_APPLIED);
        studentProfileRepository.save(student);
    }

    public WaitingPoolResponse getMyStatus(Long windowId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        WaitingPool poolEntry;
        if (windowId != null) {
            poolEntry = waitingPoolRepository.findByStudentIdAndAllocationWindowId(student.getId(), windowId)
                    .orElseThrow(() -> new ResourceNotFoundException("WaitingPool entry not found for this window", "windowId", windowId));
        } else {
            poolEntry = waitingPoolRepository.findAll().stream()
                    .filter(w -> w.getStudent().getId().equals(student.getId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("WaitingPool entry not found", "studentId", student.getId()));
        }
                
        return mapToResponse(poolEntry);
    }

    public PagedResponse<WaitingPoolResponse> getAllInPool(Long windowId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        // Getting all and then paginating manually for simplicity if we don't use specification
        List<WaitingPool> allEntries = waitingPoolRepository.findByAllocationWindowIdOrderByPriorityDescJoinedAtAsc(windowId);
        
        int start = Math.min((int)pageable.getOffset(), allEntries.size());
        int end = Math.min((start + pageable.getPageSize()), allEntries.size());
        
        Page<WaitingPool> poolPage = new org.springframework.data.domain.PageImpl<>(allEntries.subList(start, end), pageable, allEntries.size());
        
        List<WaitingPoolResponse> content = poolPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
                
        return PaginationUtil.createPagedResponse(poolPage, content);
    }

    @Transactional
    public void updatePriority(Long id, Integer priority) {
        WaitingPool entry = waitingPoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", id));
        entry.setPriority(priority);
        waitingPoolRepository.save(entry);
    }

    @Transactional
    public WaitingPoolResponse verifyEntry(Long id) {
        WaitingPool entry = waitingPoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", id));
        entry.setStatus(com.hostel.enums.ApplicationStatus.VERIFIED);
        return mapToResponse(waitingPoolRepository.save(entry));
    }

    @Transactional
    public WaitingPoolResponse approveEntry(Long id) {
        WaitingPool entry = waitingPoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", id));
        entry.setStatus(com.hostel.enums.ApplicationStatus.APPROVED);
        return mapToResponse(waitingPoolRepository.save(entry));
    }

    @Transactional
    public WaitingPoolResponse rejectEntry(Long id, String reason) {
        WaitingPool entry = waitingPoolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", id));
        entry.setStatus(com.hostel.enums.ApplicationStatus.REJECTED);
        return mapToResponse(waitingPoolRepository.save(entry));
    }

    public List<WaitingPoolResponse> getPendingPoolEntries(HostelType hostelType) {
        List<WaitingPool> entries;
        if (hostelType != null) {
            entries = waitingPoolRepository.findByHostelTypePreferenceAndStatus(hostelType, com.hostel.enums.ApplicationStatus.PENDING);
        } else {
            entries = waitingPoolRepository.findByStatus(com.hostel.enums.ApplicationStatus.PENDING);
        }
        return entries.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private WaitingPoolResponse mapToResponse(WaitingPool poolEntry) {
        RoomTypeResponse rtResponse = null;
        if (poolEntry.getPreferredRoomType() != null) {
            RoomType rt = poolEntry.getPreferredRoomType();
            rtResponse = RoomTypeResponse.builder()
                    .id(rt.getId())
                    .name(rt.getName())
                    .capacity(rt.getCapacity())
                    .isAc(rt.getIsAc())
                    .baseFee(rt.getBaseFee())
                    .isActive(rt.getIsActive())
                    .build();
        }
        
        return WaitingPoolResponse.builder()
                .id(poolEntry.getId())
                .studentId(poolEntry.getStudent().getId())
                .studentName(poolEntry.getStudent().getName())
                .registerNumber(poolEntry.getStudent().getRegisterNumber())
                .preferredRoomType(rtResponse)
                .hostelTypePreference(poolEntry.getHostelTypePreference())
                .priority(poolEntry.getPriority())
                .joinedAt(poolEntry.getJoinedAt())
                .status(poolEntry.getStatus())
                .build();
    }
}
