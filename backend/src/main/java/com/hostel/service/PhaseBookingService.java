package com.hostel.service;

import com.hostel.dto.request.PhaseOnePreferenceRequest;
import com.hostel.dto.request.PhaseTwoBookingRequest;
import com.hostel.dto.response.*;
import com.hostel.entity.*;
import com.hostel.enums.*;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.AllocationMapper;
import com.hostel.mapper.RoomMapper;
import com.hostel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhaseBookingService {

    private final PhaseOnePreferenceRepository preferenceRepository;
    private final AllocationWindowRepository windowRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomAllocationRepository allocationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private StudentProfile getStudentFromUserDetails(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));
    }

    private AllocationWindow getActiveWindow() {
        return windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN)
                .orElseThrow(() -> new BadRequestException("No active allocation window is currently open"));
    }

    @Transactional
    public PhaseOnePreferenceResponse submitPhaseOnePreference(UserDetails userDetails, PhaseOnePreferenceRequest request) {
        StudentProfile student = getStudentFromUserDetails(userDetails);
        AllocationWindow window = getActiveWindow();

        if (window.getPhase1Status() != PhaseStatus.OPEN) {
            throw new BadRequestException("Phase 1 room type preference submission is currently CLOSED.");
        }

        RoomType roomType = roomTypeRepository.findById(request.getPreferredRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", request.getPreferredRoomTypeId()));

        PhaseOnePreference preference = preferenceRepository.findByStudentIdAndAllocationWindowId(student.getId(), window.getId())
                .orElseGet(() -> PhaseOnePreference.builder()
                        .student(student)
                        .allocationWindow(window)
                        .build());

        preference.setPreferredRoomType(roomType);
        preference.setIsAc(request.getIsAc());
        preference = preferenceRepository.save(preference);

        if (student.getAllocationStatus() == StudentAllocationStatus.NOT_APPLIED) {
            student.setAllocationStatus(StudentAllocationStatus.APPLIED);
            studentProfileRepository.save(student);
        }

        return mapPreferenceToResponse(preference);
    }

    public PhaseOnePreferenceResponse getMyPhaseOnePreference(UserDetails userDetails) {
        StudentProfile student = getStudentFromUserDetails(userDetails);
        AllocationWindow window = windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN)
                .orElse(null);

        Optional<PhaseOnePreference> preferenceOpt;
        if (window != null) {
            preferenceOpt = preferenceRepository.findByStudentIdAndAllocationWindowId(student.getId(), window.getId());
        } else {
            preferenceOpt = preferenceRepository.findFirstByStudentIdOrderBySubmittedAtDesc(student.getId());
        }

        return preferenceOpt.map(this::mapPreferenceToResponse).orElse(null);
    }

    public List<RoomResponse> getAvailableRoomsForPhaseTwo(UserDetails userDetails, Integer floorNumber, Long roomTypeId, Boolean isAc) {
        StudentProfile student = getStudentFromUserDetails(userDetails);
        AllocationWindow window = getActiveWindow();

        if (window.getPhase2Status() != PhaseStatus.OPEN) {
            throw new BadRequestException("Phase 2 room booking is currently CLOSED.");
        }

        HostelType targetHostelType = (student.getGender() == Gender.MALE) ? HostelType.BOYS : HostelType.GIRLS;

        List<Room> rooms = roomRepository.findByHostelHostelTypeAndStatus(targetHostelType, RoomStatus.AVAILABLE);

        return rooms.stream()
                .filter(r -> r.getAvailableBeds() > 0)
                .filter(r -> floorNumber == null || r.getFloorNumber().equals(floorNumber))
                .filter(r -> roomTypeId == null || (r.getRoomType() != null && r.getRoomType().getId().equals(roomTypeId)))
                .filter(r -> isAc == null || (r.getRoomType() != null && r.getRoomType().getIsAc().equals(isAc)))
                .map(RoomMapper::toResponse)
                .collect(Collectors.toList());
    }

    public ValidateRoommateResponse validateRoommate(UserDetails userDetails, String registerNumber) {
        StudentProfile leader = getStudentFromUserDetails(userDetails);

        if (registerNumber == null || registerNumber.trim().isEmpty()) {
            return ValidateRoommateResponse.builder()
                    .valid(false)
                    .message("Register number cannot be empty")
                    .build();
        }

        String reg = registerNumber.trim();
        if (reg.equalsIgnoreCase(leader.getRegisterNumber())) {
            return ValidateRoommateResponse.builder()
                    .valid(false)
                    .message("You cannot add yourself as a roommate")
                    .build();
        }

        Optional<StudentProfile> studentOpt = studentProfileRepository.findByRegisterNumberIgnoreCase(reg);
        if (studentOpt.isEmpty()) {
            return ValidateRoommateResponse.builder()
                    .valid(false)
                    .registerNumber(reg)
                    .message("Student with register number '" + reg + "' does not exist in student master data")
                    .build();
        }

        StudentProfile roommate = studentOpt.get();

        if (roommate.getGender() != leader.getGender()) {
            return ValidateRoommateResponse.builder()
                    .valid(false)
                    .studentId(roommate.getId())
                    .name(roommate.getName())
                    .registerNumber(roommate.getRegisterNumber())
                    .gender(roommate.getGender().name())
                    .message("Roommate gender (" + roommate.getGender() + ") must match your gender (" + leader.getGender() + ") for hostel policy")
                    .build();
        }

        AllocationWindow window = windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN).orElse(null);
        if (window != null && allocationRepository.existsByStudentIdAndAllocationWindowId(roommate.getId(), window.getId())) {
            return ValidateRoommateResponse.builder()
                    .valid(false)
                    .studentId(roommate.getId())
                    .name(roommate.getName())
                    .registerNumber(roommate.getRegisterNumber())
                    .gender(roommate.getGender().name())
                    .message("Student " + roommate.getName() + " (" + roommate.getRegisterNumber() + ") already has an active room allocation")
                    .build();
        }

        return ValidateRoommateResponse.builder()
                .valid(true)
                .studentId(roommate.getId())
                .name(roommate.getName())
                .registerNumber(roommate.getRegisterNumber())
                .department(roommate.getDepartment())
                .year(roommate.getYear())
                .gender(roommate.getGender().name())
                .message("Valid roommate")
                .build();
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public synchronized PhaseTwoBookingResponse bookRoomPhaseTwo(UserDetails userDetails, PhaseTwoBookingRequest request) {
        StudentProfile leader = getStudentFromUserDetails(userDetails);
        AllocationWindow window = getActiveWindow();

        if (window.getPhase2Status() != PhaseStatus.OPEN) {
            throw new BadRequestException("Phase 2 room booking is currently CLOSED.");
        }

        if (allocationRepository.existsByStudentIdAndAllocationWindowId(leader.getId(), window.getId())) {
            throw new DuplicateResourceException("You already have an active room allocation for this window.");
        }

        Room room = roomRepository.findByIdWithLock(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", request.getRoomId()));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new BadRequestException("Room " + room.getRoomNumber() + " is no longer available for booking.");
        }

        HostelType expectedHostelType = (leader.getGender() == Gender.MALE) ? HostelType.BOYS : HostelType.GIRLS;
        if (room.getHostel().getHostelType() != expectedHostelType) {
            throw new BadRequestException("You can only book rooms in the " + expectedHostelType + " hostel.");
        }

        // Roommates validation & sanitization
        Set<String> cleanRegs = new LinkedHashSet<>();
        if (request.getRoommateRegisterNumbers() != null) {
            for (String reg : request.getRoommateRegisterNumbers()) {
                if (reg != null && !reg.trim().isEmpty()) {
                    String trimmed = reg.trim().toUpperCase();
                    if (trimmed.equalsIgnoreCase(leader.getRegisterNumber())) {
                        throw new BadRequestException("You cannot add yourself as a roommate in the list.");
                    }
                    if (!cleanRegs.add(trimmed)) {
                        throw new BadRequestException("Duplicate roommate register number: " + trimmed);
                    }
                }
            }
        }

        int totalGroupSize = 1 + cleanRegs.size();
        int availableBeds = room.getAvailableBeds();

        if (totalGroupSize > availableBeds) {
            throw new BadRequestException("Not enough available beds in Room " + room.getRoomNumber() +
                    ". Requested: " + totalGroupSize + ", Available: " + availableBeds);
        }

        List<StudentProfile> allMembers = new ArrayList<>();
        allMembers.add(leader);

        for (String reg : cleanRegs) {
            StudentProfile rm = studentProfileRepository.findByRegisterNumberIgnoreCase(reg)
                    .orElseThrow(() -> new BadRequestException("Roommate with register number " + reg + " not found."));

            if (rm.getGender() != leader.getGender()) {
                throw new BadRequestException("Roommate " + rm.getName() + " (" + reg + ") gender does not match hostel rules.");
            }

            if (allocationRepository.existsByStudentIdAndAllocationWindowId(rm.getId(), window.getId())) {
                throw new BadRequestException("Roommate " + rm.getName() + " (" + reg + ") already has an allocated room.");
            }

            allMembers.add(rm);
        }

        // Determine existing occupied bed numbers
        List<RoomAllocation> existingAllocations = allocationRepository.findByRoomIdAndAllocationWindowId(room.getId(), window.getId());
        Set<Integer> occupiedBedNumbers = existingAllocations.stream()
                .map(RoomAllocation::getBedNumber)
                .collect(Collectors.toSet());

        int maxBedCapacity = room.getEffectiveCapacity();
        int nextBed = 1;

        List<RoomAllocation> newAllocations = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (StudentProfile member : allMembers) {
            while (occupiedBedNumbers.contains(nextBed) && nextBed <= maxBedCapacity) {
                nextBed++;
            }
            if (nextBed > maxBedCapacity) {
                nextBed = room.getOccupiedBeds() + newAllocations.size() + 1;
            }

            occupiedBedNumbers.add(nextBed);

            RoomAllocation allocation = RoomAllocation.builder()
                    .student(member)
                    .room(room)
                    .allocationWindow(window)
                    .bedNumber(nextBed)
                    .status(AllocationStatus.ACCEPTED)
                    .allocationType(AllocationType.MANUAL)
                    .allocatedAt(now)
                    .respondedAt(now)
                    .build();

            newAllocations.add(allocation);

            member.setAllocationStatus(StudentAllocationStatus.ALLOCATED);
            studentProfileRepository.save(member);
        }

        allocationRepository.saveAll(newAllocations);

        room.setOccupiedBeds(room.getOccupiedBeds() + totalGroupSize);
        if (room.getAvailableBeds() == 0) {
            room.setStatus(RoomStatus.OCCUPIED);
        } else {
            room.setStatus(RoomStatus.AVAILABLE);
        }
        roomRepository.save(room);

        // Send notifications
        for (StudentProfile member : allMembers) {
            try {
                notificationService.createNotification(
                        member.getUser().getId(),
                        "Room Booking Confirmed",
                        "You have been successfully allocated to Room " + room.getRoomNumber() + " (Bed " +
                                newAllocations.stream().filter(a -> a.getStudent().getId().equals(member.getId())).findFirst().map(RoomAllocation::getBedNumber).orElse(1) + ") in " + room.getHostel().getName() + ".",
                        NotificationType.ALLOCATION,
                        "ROOM",
                        room.getId()
                );
            } catch (Exception ignored) {
            }
        }

        List<AllocationResponse> allocationResponses = newAllocations.stream()
                .map(AllocationMapper::toResponse)
                .collect(Collectors.toList());

        return PhaseTwoBookingResponse.builder()
                .roomId(room.getId())
                .roomNumber(room.getRoomNumber())
                .building(room.getBuilding() != null ? room.getBuilding() : "Main Block")
                .hostelName(room.getHostel().getName())
                .floorNumber(room.getFloorNumber())
                .roomTypeName(room.getRoomType().getName())
                .isAc(room.getRoomType().getIsAc())
                .totalCapacity(room.getEffectiveCapacity())
                .occupiedBeds(room.getOccupiedBeds())
                .availableBeds(room.getAvailableBeds())
                .allocations(allocationResponses)
                .bookedAt(now)
                .build();
    }

    public BookingStatusResponse getMyBookingStatus(UserDetails userDetails) {
        StudentProfile student = getStudentFromUserDetails(userDetails);
        AllocationWindow window = windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN)
                .orElse(null);

        PhaseOnePreference preference = null;
        if (window != null) {
            preference = preferenceRepository.findByStudentIdAndAllocationWindowId(student.getId(), window.getId()).orElse(null);
        } else {
            preference = preferenceRepository.findFirstByStudentIdOrderBySubmittedAtDesc(student.getId()).orElse(null);
        }

        Optional<RoomAllocation> myAllocationOpt = (window != null)
                ? allocationRepository.findByStudentIdAndAllocationWindowId(student.getId(), window.getId())
                : allocationRepository.findFirstByStudentIdOrderByAllocatedAtDesc(student.getId());

        AllocationResponse myAllocationResponse = myAllocationOpt.map(AllocationMapper::toResponse).orElse(null);

        List<AllocationResponse> roommates = new ArrayList<>();
        if (myAllocationOpt.isPresent()) {
            RoomAllocation myAlloc = myAllocationOpt.get();
            Long windowId = myAlloc.getAllocationWindow() != null ? myAlloc.getAllocationWindow().getId() : (window != null ? window.getId() : null);
            if (windowId != null && myAlloc.getRoom() != null) {
                roommates = allocationRepository.findByRoomIdAndAllocationWindowId(myAlloc.getRoom().getId(), windowId)
                        .stream()
                        .filter(a -> !a.getStudent().getId().equals(student.getId()))
                        .map(AllocationMapper::toResponse)
                        .collect(Collectors.toList());
            }
        }

        return BookingStatusResponse.builder()
                .window(window != null ? mapWindowToResponse(window) : null)
                .phase1Status(window != null && window.getPhase1Status() != null ? window.getPhase1Status() : PhaseStatus.NOT_OPEN)
                .phase2Status(window != null && window.getPhase2Status() != null ? window.getPhase2Status() : PhaseStatus.NOT_OPEN)
                .hasSubmittedPhase1(preference != null)
                .phase1Preference(preference != null ? mapPreferenceToResponse(preference) : null)
                .hasBookedPhase2(myAllocationOpt.isPresent())
                .allocation(myAllocationResponse)
                .roommates(roommates)
                .build();
    }

    public List<PhaseOnePreferenceResponse> getAllPhaseOneSubmissions(Long windowId) {
        Long targetWindowId = windowId;
        if (targetWindowId == null) {
            AllocationWindow active = windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN).orElse(null);
            if (active != null) {
                targetWindowId = active.getId();
            }
        }
        if (targetWindowId == null) {
            return Collections.emptyList();
        }
        return preferenceRepository.findByAllocationWindowId(targetWindowId).stream()
                .map(this::mapPreferenceToResponse)
                .collect(Collectors.toList());
    }

    public List<AllocationResponse> getAllPhaseTwoSelections(Long windowId) {
        Long targetWindowId = windowId;
        if (targetWindowId == null) {
            AllocationWindow active = windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN).orElse(null);
            if (active != null) {
                targetWindowId = active.getId();
            }
        }
        if (targetWindowId == null) {
            return Collections.emptyList();
        }
        return allocationRepository.findByAllocationWindowId(targetWindowId).stream()
                .map(AllocationMapper::toResponse)
                .collect(Collectors.toList());
    }

    private PhaseOnePreferenceResponse mapPreferenceToResponse(PhaseOnePreference p) {
        return PhaseOnePreferenceResponse.builder()
                .id(p.getId())
                .studentId(p.getStudent().getId())
                .studentName(p.getStudent().getName())
                .registerNumber(p.getStudent().getRegisterNumber())
                .allocationWindowId(p.getAllocationWindow().getId())
                .windowName(p.getAllocationWindow().getName())
                .preferredRoomTypeId(p.getPreferredRoomType().getId())
                .preferredRoomTypeName(p.getPreferredRoomType().getName())
                .capacity(p.getPreferredRoomType().getCapacity())
                .isAc(p.getIsAc())
                .submittedAt(p.getSubmittedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private AllocationWindowResponse mapWindowToResponse(AllocationWindow w) {
        return AllocationWindowResponse.builder()
                .id(w.getId())
                .name(w.getName())
                .academicYear(w.getAcademicYear())
                .semester(w.getSemester())
                .startDate(w.getStartDate())
                .endDate(w.getEndDate())
                .status(w.getStatus())
                .phase1Status(w.getPhase1Status())
                .phase2Status(w.getPhase2Status())
                .createdAt(w.getCreatedAt())
                .build();
    }
}
