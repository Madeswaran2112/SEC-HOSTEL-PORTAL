package com.hostel.service;

import com.hostel.dto.request.WaitingPoolJoinRequest;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.RoomTypeResponse;
import com.hostel.dto.response.WaitingPoolResponse;
import com.hostel.entity.*;
import com.hostel.enums.*;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final RoomRepository roomRepository;
    private final RoomAllocationRepository roomAllocationRepository;
    private final NotificationService notificationService;
    private final AuditLogRepository auditLogRepository;

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

        // Check if student already has active waiting entry
        List<WaitlistStatus> nonActive = List.of(WaitlistStatus.CANCELLED, WaitlistStatus.DECLINED, WaitlistStatus.EXPIRED);
        if (waitingPoolRepository.existsByStudentIdAndAllocationWindowIdAndStatusNotIn(student.getId(), window.getId(), nonActive)) {
            throw new DuplicateResourceException("You already have an active waiting list entry for this window");
        }

        RoomType prefType = null;
        if (request.getPreferredRoomTypeId() != null) {
            prefType = roomTypeRepository.findById(request.getPreferredRoomTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", request.getPreferredRoomTypeId()));
        }

        HostelType hostelPref = student.getGender() == Gender.MALE ? HostelType.BOYS : HostelType.GIRLS;

        // Compute priority: next in line for this hostel & window
        List<WaitingPool> currentQueue = waitingPoolRepository
                .findByAllocationWindowIdAndHostelTypePreferenceOrderByPriorityAscJoinedAtAsc(window.getId(), hostelPref);
        int nextPriority = currentQueue.isEmpty() ? 1 : currentQueue.get(currentQueue.size() - 1).getPriority() + 1;

        WaitingPool poolEntry = WaitingPool.builder()
                .student(student)
                .allocationWindow(window)
                .preferredRoomType(prefType)
                .isAc(request.getIsAc())
                .hostelTypePreference(hostelPref)
                .groupSize(request.getGroupSize() != null && request.getGroupSize() > 0 ? request.getGroupSize() : 1)
                .floorPreference(request.getFloorPreference())
                .reason(request.getReason() != null ? request.getReason() : "Preferred room unavailable")
                .priority(nextPriority)
                .status(WaitlistStatus.WAITING)
                .joinedAt(LocalDateTime.now())
                .build();

        poolEntry = waitingPoolRepository.save(poolEntry);
        
        // Update student allocation status
        student.setAllocationStatus(StudentAllocationStatus.IN_POOL);
        studentProfileRepository.save(student);

        return mapToResponse(poolEntry, currentQueue.size() + 1);
    }

    @Transactional
    public void leavePool(Long windowId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        WaitingPool poolEntry = (windowId != null)
                ? waitingPoolRepository.findByStudentIdAndAllocationWindowId(student.getId(), windowId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "studentId", student.getId()))
                : waitingPoolRepository.findFirstByStudentIdOrderByJoinedAtDesc(student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "studentId", student.getId()));

        poolEntry.setStatus(WaitlistStatus.CANCELLED);
        Room offeredRoom = poolEntry.getOfferedRoom();
        poolEntry.setOfferedRoom(null);
        waitingPoolRepository.save(poolEntry);

        student.setAllocationStatus(StudentAllocationStatus.NOT_APPLIED);
        studentProfileRepository.save(student);

        // If had an offered room, promote next candidate
        if (offeredRoom != null) {
            promoteNextCandidate(offeredRoom, poolEntry.getAllocationWindow());
        }
    }

    public WaitingPoolResponse getMyStatus(Long windowId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        WaitingPool poolEntry = (windowId != null)
                ? waitingPoolRepository.findByStudentIdAndAllocationWindowId(student.getId(), windowId).orElse(null)
                : waitingPoolRepository.findFirstByStudentIdOrderByJoinedAtDesc(student.getId()).orElse(null);

        if (poolEntry == null) return null;

        // Check if offer expired
        if (poolEntry.getStatus() == WaitlistStatus.OFFERED && poolEntry.getOfferExpiresAt() != null) {
            if (LocalDateTime.now().isAfter(poolEntry.getOfferExpiresAt())) {
                poolEntry.setStatus(WaitlistStatus.EXPIRED);
                Room expiredRoom = poolEntry.getOfferedRoom();
                poolEntry.setOfferedRoom(null);
                waitingPoolRepository.save(poolEntry);
                if (expiredRoom != null) {
                    promoteNextCandidate(expiredRoom, poolEntry.getAllocationWindow());
                }
            }
        }

        int position = computeQueuePosition(poolEntry);
        return mapToResponse(poolEntry, position);
    }

    @Transactional
    public WaitingPoolResponse acceptOffer(Long poolEntryId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        WaitingPool entry = waitingPoolRepository.findById(poolEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", poolEntryId));

        if (!entry.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Unauthorized access to this waitlist offer");
        }

        if (entry.getStatus() != WaitlistStatus.OFFERED || entry.getOfferedRoom() == null) {
            throw new BadRequestException("No active room offer available for this entry");
        }

        if (entry.getOfferExpiresAt() != null && LocalDateTime.now().isAfter(entry.getOfferExpiresAt())) {
            entry.setStatus(WaitlistStatus.EXPIRED);
            Room expRoom = entry.getOfferedRoom();
            entry.setOfferedRoom(null);
            waitingPoolRepository.save(entry);
            if (expRoom != null) {
                promoteNextCandidate(expRoom, entry.getAllocationWindow());
            }
            throw new BadRequestException("Room offer has expired");
        }

        Room room = roomRepository.findByIdWithLock(entry.getOfferedRoom().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", entry.getOfferedRoom().getId()));

        if (room.getAvailableBeds() <= 0) {
            throw new BadRequestException("Room has no available beds");
        }

        // Allocate student to room
        int assignedBed = room.getOccupiedBeds() + 1;
        RoomAllocation allocation = RoomAllocation.builder()
                .student(student)
                .room(room)
                .allocationWindow(entry.getAllocationWindow())
                .bedNumber(assignedBed)
                .status(AllocationStatus.ACCEPTED)
                .allocationType(AllocationType.AUTO)
                .allocatedAt(LocalDateTime.now())
                .build();
        roomAllocationRepository.save(allocation);

        // Update room capacity
        room.setOccupiedBeds(room.getOccupiedBeds() + 1);
        if (room.getAvailableBeds() <= 0) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(RoomStatus.OCCUPIED);
        }
        roomRepository.save(room);

        // Update entry status
        entry.setStatus(WaitlistStatus.ACCEPTED);
        waitingPoolRepository.save(entry);

        student.setAllocationStatus(StudentAllocationStatus.CONFIRMED);
        studentProfileRepository.save(student);

        notificationService.createNotification(
                user.getId(),
                "Room Allocation Confirmed!",
                "You have accepted the offer for Room " + room.getRoomNumber() + " (Bed #" + assignedBed + ").",
                NotificationType.ALLOCATION,
                "ROOM",
                room.getId()
        );

        return mapToResponse(entry, 0);
    }

    @Transactional
    public void declineOffer(Long poolEntryId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        WaitingPool entry = waitingPoolRepository.findById(poolEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", poolEntryId));

        if (!entry.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("Unauthorized access to this waitlist offer");
        }

        if (entry.getStatus() != WaitlistStatus.OFFERED) {
            throw new BadRequestException("Entry is not in OFFERED status");
        }

        Room releasedRoom = entry.getOfferedRoom();
        entry.setStatus(WaitlistStatus.DECLINED);
        entry.setOfferedRoom(null);
        waitingPoolRepository.save(entry);

        student.setAllocationStatus(StudentAllocationStatus.APPLIED);
        studentProfileRepository.save(student);

        // Immediately promote next eligible candidate!
        if (releasedRoom != null) {
            promoteNextCandidate(releasedRoom, entry.getAllocationWindow());
        }
    }

    /**
     * Automatic Waitlist Promotion:
     * When a bed becomes available, scan the queue in priority/date order for compatible candidates
     * and issue a 24-hour room offer.
     */
    @Transactional
    public void promoteNextCandidate(Room room, AllocationWindow window) {
        if (room == null || window == null) return;
        int availableBeds = room.getAvailableBeds();
        if (availableBeds <= 0) return;

        HostelType hostelType = room.getHostel().getHostelType();

        List<WaitingPool> queue = waitingPoolRepository
                .findByAllocationWindowIdAndHostelTypePreferenceAndStatusOrderByPriorityAscJoinedAtAsc(
                        window.getId(), hostelType, WaitlistStatus.WAITING
                );

        for (WaitingPool candidate : queue) {
            if (availableBeds <= 0) break;

            // 1. Room Type match check
            if (candidate.getPreferredRoomType() != null &&
                    !candidate.getPreferredRoomType().getId().equals(room.getRoomType().getId())) {
                continue; // Keep earlier candidate waiting for their specific type
            }

            // 2. AC match check
            if (candidate.getIsAc() != null &&
                    !candidate.getIsAc().equals(room.getRoomType().getIsAc())) {
                continue;
            }

            // 3. Group capacity match
            int reqBeds = (candidate.getGroupSize() != null && candidate.getGroupSize() > 0) ? candidate.getGroupSize() : 1;
            if (reqBeds > availableBeds) {
                continue;
            }

            // Compatible candidate found! Issue offer
            candidate.setStatus(WaitlistStatus.OFFERED);
            candidate.setOfferedRoom(room);
            candidate.setOfferedAt(LocalDateTime.now());
            candidate.setOfferExpiresAt(LocalDateTime.now().plusHours(24));
            waitingPoolRepository.save(candidate);

            notificationService.createNotification(
                    candidate.getStudent().getUser().getId(),
                    "Room Offer Available!",
                    "Room " + room.getRoomNumber() + " (" + room.getRoomType().getName() + ") in " + room.getHostel().getName()
                            + " has been offered to you from the Waiting List. Please accept or decline within 24 hours.",
                    NotificationType.ALLOCATION,
                    "WAITLIST_OFFER",
                    candidate.getId()
            );

            availableBeds -= reqBeds;
        }
    }

    // ==========================================
    // ADMIN WAITING LIST MANAGEMENT ENDPOINTS
    // ==========================================

    public PagedResponse<WaitingPoolResponse> getAdminWaitlist(
            Long windowId,
            HostelType hostelType,
            WaitlistStatus status,
            String search,
            int page,
            int size) {

        if (windowId == null) {
            List<AllocationWindow> openWindows = windowRepository.findByStatus(AllocationWindowStatus.OPEN);
            if (!openWindows.isEmpty()) {
                windowId = openWindows.get(0).getId();
            } else {
                List<AllocationWindow> allWindows = windowRepository.findAll();
                if (!allWindows.isEmpty()) {
                    windowId = allWindows.get(0).getId();
                }
            }
        }

        if (windowId == null) {
            return PagedResponse.<WaitingPoolResponse>builder()
                    .content(new ArrayList<>())
                    .page(page)
                    .size(size)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build();
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<WaitingPool> entriesPage = (hostelType != null)
                ? waitingPoolRepository.findByAllocationWindowIdAndHostelTypePreference(windowId, hostelType, pageable)
                : waitingPoolRepository.findByAllocationWindowId(windowId, pageable);

        List<WaitingPool> allWindowEntries = (hostelType != null)
                ? waitingPoolRepository.findByAllocationWindowIdAndHostelTypePreferenceOrderByPriorityAscJoinedAtAsc(windowId, hostelType)
                : waitingPoolRepository.findByAllocationWindowId(windowId);

        List<WaitingPoolResponse> list = entriesPage.getContent().stream()
                .filter(e -> status == null || e.getStatus() == status)
                .filter(e -> {
                    if (search == null || search.isBlank()) return true;
                    String s = search.toLowerCase();
                    return e.getStudent().getName().toLowerCase().contains(s)
                            || e.getStudent().getRegisterNumber().toLowerCase().contains(s);
                })
                .map(e -> {
                    int pos = allWindowEntries.indexOf(e) + 1;
                    return mapToResponse(e, pos > 0 ? pos : 1);
                })
                .collect(Collectors.toList());

        return PagedResponse.<WaitingPoolResponse>builder()
                .content(list)
                .page(page)
                .size(size)
                .totalElements(entriesPage.getTotalElements())
                .totalPages(entriesPage.getTotalPages())
                .last(entriesPage.isLast())
                .build();
    }

    @Transactional
    public void adminIssueOffer(Long poolEntryId, Long roomId, String adminEmail) {
        WaitingPool entry = waitingPoolRepository.findById(poolEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", poolEntryId));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));

        if (!room.getHostel().getHostelType().equals(entry.getHostelTypePreference())) {
            throw new BadRequestException("Cannot assign room of different hostel category to student");
        }

        if (room.getAvailableBeds() <= 0) {
            throw new BadRequestException("Selected room has no available beds");
        }

        entry.setStatus(WaitlistStatus.OFFERED);
        entry.setOfferedRoom(room);
        entry.setOfferedAt(LocalDateTime.now());
        entry.setOfferExpiresAt(LocalDateTime.now().plusHours(24));
        entry.setAdminNotes("Offer manually issued by Admin " + adminEmail);
        waitingPoolRepository.save(entry);

        notificationService.createNotification(
                entry.getStudent().getUser().getId(),
                "Room Offer Available from Admin",
                "Room " + room.getRoomNumber() + " has been offered to you. Please accept or decline within 24 hours.",
                NotificationType.ALLOCATION,
                "WAITLIST_OFFER",
                entry.getId()
        );

        logAudit("ISSUE_WAITLIST_OFFER", "WAITING_POOL", entry.getId(), null, "Offered room " + room.getRoomNumber(), adminEmail);
    }

    @Transactional
    public void adminCancelEntry(Long poolEntryId, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A valid reason is required to cancel a waiting list entry");
        }

        WaitingPool entry = waitingPoolRepository.findById(poolEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", poolEntryId));

        String oldStatus = entry.getStatus().name();
        entry.setStatus(WaitlistStatus.CANCELLED);
        Room offeredRoom = entry.getOfferedRoom();
        entry.setOfferedRoom(null);
        entry.setAdminNotes("Cancelled by " + adminEmail + ": " + reason);
        waitingPoolRepository.save(entry);

        entry.getStudent().setAllocationStatus(StudentAllocationStatus.NOT_APPLIED);
        studentProfileRepository.save(entry.getStudent());

        logAudit("CANCEL_WAITLIST_ENTRY", "WAITING_POOL", entry.getId(), oldStatus, "CANCELLED - " + reason, adminEmail);

        if (offeredRoom != null) {
            promoteNextCandidate(offeredRoom, entry.getAllocationWindow());
        }
    }

    @Transactional
    public void adminUpdatePriority(Long poolEntryId, Integer newPriority, String reason, String adminEmail) {
        if (newPriority == null || newPriority < 1) {
            throw new BadRequestException("Priority rank must be a positive integer");
        }
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A mandatory reason is required to update queue priority");
        }

        WaitingPool entry = waitingPoolRepository.findById(poolEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", poolEntryId));

        int oldPriority = entry.getPriority();
        entry.setPriority(newPriority);
        entry.setAdminNotes("Priority changed by " + adminEmail + " from " + oldPriority + " to " + newPriority + ". Reason: " + reason);
        waitingPoolRepository.save(entry);

        logAudit("REORDER_WAITLIST_PRIORITY", "WAITING_POOL", entry.getId(), String.valueOf(oldPriority), newPriority + " - " + reason, adminEmail);
    }

    @Transactional
    public void adminExceptionalAllocate(Long poolEntryId, Long roomId, String reason, String adminEmail) {
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("A mandatory reason is required for exceptional allocation");
        }

        WaitingPool entry = waitingPoolRepository.findById(poolEntryId)
                .orElseThrow(() -> new ResourceNotFoundException("WaitingPool", "id", poolEntryId));

        Room room = roomRepository.findByIdWithLock(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", roomId));

        if (!room.getHostel().getHostelType().equals(entry.getHostelTypePreference())) {
            throw new BadRequestException("Hostel category mismatch");
        }

        if (room.getAvailableBeds() <= 0) {
            throw new BadRequestException("Room has no available beds");
        }

        int bedNum = room.getOccupiedBeds() + 1;
        RoomAllocation alloc = RoomAllocation.builder()
                .student(entry.getStudent())
                .room(room)
                .allocationWindow(entry.getAllocationWindow())
                .bedNumber(bedNum)
                .status(AllocationStatus.ACCEPTED)
                .allocationType(AllocationType.MANUAL)
                .allocatedAt(LocalDateTime.now())
                .build();
        roomAllocationRepository.save(alloc);

        room.setOccupiedBeds(room.getOccupiedBeds() + 1);
        if (room.getAvailableBeds() <= 0) room.setStatus(RoomStatus.FULL);
        else room.setStatus(RoomStatus.OCCUPIED);
        roomRepository.save(room);

        entry.setStatus(WaitlistStatus.ALLOCATED);
        entry.setAdminNotes("Exceptional allocation by " + adminEmail + ": " + reason);
        waitingPoolRepository.save(entry);

        entry.getStudent().setAllocationStatus(StudentAllocationStatus.CONFIRMED);
        studentProfileRepository.save(entry.getStudent());

        logAudit("EXCEPTIONAL_ALLOCATION", "WAITING_POOL", entry.getId(), null, "Allocated to room " + room.getRoomNumber() + " - " + reason, adminEmail);
    }

    private int computeQueuePosition(WaitingPool entry) {
        if (entry.getStatus() != WaitlistStatus.WAITING && entry.getStatus() != WaitlistStatus.OFFERED) {
            return 0;
        }
        List<WaitingPool> queue = waitingPoolRepository
                .findByAllocationWindowIdAndHostelTypePreferenceAndStatusOrderByPriorityAscJoinedAtAsc(
                        entry.getAllocationWindow().getId(), entry.getHostelTypePreference(), WaitlistStatus.WAITING
                );
        int index = queue.indexOf(entry);
        return index >= 0 ? index + 1 : 1;
    }

    private WaitingPoolResponse mapToResponse(WaitingPool pool, int queuePos) {
        RoomTypeResponse rtResp = null;
        if (pool.getPreferredRoomType() != null) {
            RoomType rt = pool.getPreferredRoomType();
            rtResp = RoomTypeResponse.builder()
                    .id(rt.getId())
                    .name(rt.getName())
                    .capacity(rt.getCapacity())
                    .isAc(rt.getIsAc())
                    .baseFee(rt.getBaseFee())
                    .build();
        }

        Room offered = pool.getOfferedRoom();

        return WaitingPoolResponse.builder()
                .id(pool.getId())
                .studentId(pool.getStudent().getId())
                .studentName(pool.getStudent().getName())
                .registerNumber(pool.getStudent().getRegisterNumber())
                .department(pool.getStudent().getDepartment())
                .year(pool.getStudent().getYear())
                .preferredRoomType(rtResp)
                .isAc(pool.getIsAc())
                .groupSize(pool.getGroupSize())
                .floorPreference(pool.getFloorPreference())
                .reason(pool.getReason())
                .hostelTypePreference(pool.getHostelTypePreference())
                .priority(pool.getPriority())
                .queuePosition(queuePos)
                .joinedAt(pool.getJoinedAt())
                .status(pool.getStatus())
                .offeredRoomId(offered != null ? offered.getId() : null)
                .offeredRoomNumber(offered != null ? offered.getRoomNumber() : null)
                .offeredRoomTypeName(offered != null ? offered.getRoomType().getName() : null)
                .offeredRoomBuilding(offered != null ? offered.getBuilding() : null)
                .offeredRoomFloor(offered != null ? offered.getFloorNumber() : null)
                .offeredAt(pool.getOfferedAt())
                .offerExpiresAt(pool.getOfferExpiresAt())
                .adminNotes(pool.getAdminNotes())
                .build();
    }

    private void logAudit(String action, String entityType, Long entityId, String oldValue, String newValue, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        AuditLog log = AuditLog.builder()
                .user(admin)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        auditLogRepository.save(log);
    }
}
