package com.hostel.service;

import com.hostel.dto.request.AllocationWindowRequest;
import com.hostel.dto.request.PhaseScheduleRequest;
import com.hostel.dto.response.AllocationWindowResponse;
import com.hostel.entity.AllocationWindow;
import com.hostel.enums.AllocationWindowStatus;
import com.hostel.enums.PhaseStatus;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.AllocationWindowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllocationWindowService {

    private final AllocationWindowRepository windowRepository;

    @Transactional
    public AllocationWindowResponse createWindow(AllocationWindowRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }
        
        AllocationWindow window = AllocationWindow.builder()
                .name(request.getName())
                .academicYear(request.getAcademicYear())
                .semester(request.getSemester())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(AllocationWindowStatus.UPCOMING)
                .phase1Status(PhaseStatus.NOT_OPEN)
                .phase2Status(PhaseStatus.NOT_OPEN)
                .build();
                
        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    public List<AllocationWindowResponse> getAllWindows() {
        return windowRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public AllocationWindowResponse getActiveWindow() {
        return windowRepository.findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus.OPEN)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "status", "OPEN"));
    }

    public AllocationWindowResponse getWindowById(Long id) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse updateWindow(Long id, AllocationWindowRequest request) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
                
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new BadRequestException("Start date must be before end date");
        }

        window.setName(request.getName());
        window.setAcademicYear(request.getAcademicYear());
        window.setSemester(request.getSemester());
        window.setStartDate(request.getStartDate());
        window.setEndDate(request.getEndDate());

        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse changeStatus(Long id, AllocationWindowStatus status) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
                
        if (status == AllocationWindowStatus.OPEN) {
            windowRepository.findByStatus(AllocationWindowStatus.OPEN).forEach(w -> {
                w.setStatus(AllocationWindowStatus.CLOSED);
                windowRepository.save(w);
            });
        }
                
        window.setStatus(status);
        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse changePhase1Status(Long id, PhaseStatus status) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
        window.setPhase1Status(status);
        if (status == PhaseStatus.OPEN && window.getPhase1StartDate() == null) {
            window.setPhase1StartDate(ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime());
        }
        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse changePhase2Status(Long id, PhaseStatus status) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
        window.setPhase2Status(status);
        if (status == PhaseStatus.OPEN && window.getPhase2StartDate() == null) {
            window.setPhase2StartDate(ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime());
        }
        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse updatePhaseSchedule(Long id, PhaseScheduleRequest request) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));

        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (!request.getEndDate().isAfter(request.getStartDate())) {
                throw new BadRequestException("Phase end date and time must be strictly after the start date and time");
            }
        }

        if (request.getPhase() == 1) {
            if (request.getAcademicYear() != null && !request.getAcademicYear().isBlank()) {
                window.setAcademicYear(request.getAcademicYear());
            }
            if (request.getStartDate() != null) window.setPhase1StartDate(request.getStartDate());
            if (request.getEndDate() != null) window.setPhase1EndDate(request.getEndDate());
            if (request.getDescription() != null) window.setPhase1Description(request.getDescription());
            if (request.getStatus() != null) window.setPhase1Status(request.getStatus());
        } else if (request.getPhase() == 2) {
            if (request.getAcademicYear() != null && !request.getAcademicYear().isBlank()) {
                window.setAcademicYear(request.getAcademicYear());
            }
            if (request.getStartDate() != null) window.setPhase2StartDate(request.getStartDate());
            if (request.getEndDate() != null) window.setPhase2EndDate(request.getEndDate());
            if (request.getDescription() != null) window.setPhase2Description(request.getDescription());
            if (request.getStatus() != null) window.setPhase2Status(request.getStatus());
        } else {
            throw new BadRequestException("Invalid phase number. Must be 1 or 2");
        }

        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    public AllocationWindowResponse mapToResponse(AllocationWindow window) {
        LocalDateTime nowKolkata = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();

        return AllocationWindowResponse.builder()
                .id(window.getId())
                .name(window.getName())
                .academicYear(window.getAcademicYear())
                .semester(window.getSemester())
                .startDate(window.getStartDate())
                .endDate(window.getEndDate())
                .status(window.getStatus())
                // Phase 1
                .phase1Status(window.getPhase1Status() != null ? window.getPhase1Status() : PhaseStatus.NOT_OPEN)
                .effectivePhase1Status(window.getEffectivePhase1Status())
                .phase1StartDate(window.getPhase1StartDate())
                .phase1EndDate(window.getPhase1EndDate())
                .phase1Description(window.getPhase1Description())
                // Phase 2
                .phase2Status(window.getPhase2Status() != null ? window.getPhase2Status() : PhaseStatus.NOT_OPEN)
                .effectivePhase2Status(window.getEffectivePhase2Status())
                .phase2StartDate(window.getPhase2StartDate())
                .phase2EndDate(window.getPhase2EndDate())
                .phase2Description(window.getPhase2Description())
                // Server time in Asia/Kolkata
                .serverTime(nowKolkata)
                .createdAt(window.getCreatedAt())
                .build();
    }
}
