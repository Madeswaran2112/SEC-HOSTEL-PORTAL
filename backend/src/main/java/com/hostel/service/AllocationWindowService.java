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

        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();

        if (status == PhaseStatus.OPEN) {
            if (window.getPhase1EndDate() != null && now.isAfter(window.getPhase1EndDate())) {
                throw new BadRequestException("Cannot open Phase 1 because the scheduled end date (" + 
                        window.getPhase1EndDate() + ") has already passed. Please update the schedule with a future end date before opening.");
            }
            if (window.getPhase1StartDate() == null || now.isBefore(window.getPhase1StartDate())) {
                window.setPhase1StartDate(now);
            }
            if (window.getPhase1EndDate() == null) {
                window.setPhase1EndDate(now.plusDays(7));
            }
            window.setPhase1Status(PhaseStatus.OPEN);
        } else if (status == PhaseStatus.CLOSED) {
            window.setPhase1Status(PhaseStatus.CLOSED);
            if (window.getPhase1EndDate() == null || now.isBefore(window.getPhase1EndDate())) {
                window.setPhase1EndDate(now);
            }
        } else {
            window.setPhase1Status(status);
        }

        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse changePhase2Status(Long id, PhaseStatus status) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));

        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();

        if (status == PhaseStatus.OPEN) {
            if (window.getPhase2EndDate() != null && now.isAfter(window.getPhase2EndDate())) {
                throw new BadRequestException("Cannot open Phase 2 because the scheduled end date (" + 
                        window.getPhase2EndDate() + ") has already passed. Please update the schedule with a future end date before opening.");
            }
            if (window.getPhase2StartDate() == null || now.isBefore(window.getPhase2StartDate())) {
                window.setPhase2StartDate(now);
            }
            if (window.getPhase2EndDate() == null) {
                window.setPhase2EndDate(now.plusDays(7));
            }
            window.setPhase2Status(PhaseStatus.OPEN);
        } else if (status == PhaseStatus.CLOSED) {
            window.setPhase2Status(PhaseStatus.CLOSED);
            if (window.getPhase2EndDate() == null || now.isBefore(window.getPhase2EndDate())) {
                window.setPhase2EndDate(now);
            }
        } else {
            window.setPhase2Status(status);
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

        LocalDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).toLocalDateTime();

        if (request.getPhase() == 1) {
            if (request.getAcademicYear() != null && !request.getAcademicYear().isBlank()) {
                window.setAcademicYear(request.getAcademicYear());
            }
            if (request.getStartDate() != null) window.setPhase1StartDate(request.getStartDate());
            if (request.getEndDate() != null) window.setPhase1EndDate(request.getEndDate());
            if (request.getDescription() != null) window.setPhase1Description(request.getDescription());
            if (request.getStatus() != null) {
                window.setPhase1Status(request.getStatus());
            } else {
                if (window.getPhase1StartDate() != null && window.getPhase1EndDate() != null) {
                    if (now.isAfter(window.getPhase1StartDate()) && now.isBefore(window.getPhase1EndDate())) {
                        window.setPhase1Status(PhaseStatus.OPEN);
                    } else if (now.isBefore(window.getPhase1StartDate())) {
                        window.setPhase1Status(PhaseStatus.NOT_OPEN);
                    } else if (now.isAfter(window.getPhase1EndDate())) {
                        window.setPhase1Status(PhaseStatus.CLOSED);
                    }
                }
            }
        } else if (request.getPhase() == 2) {
            if (request.getAcademicYear() != null && !request.getAcademicYear().isBlank()) {
                window.setAcademicYear(request.getAcademicYear());
            }
            if (request.getStartDate() != null) window.setPhase2StartDate(request.getStartDate());
            if (request.getEndDate() != null) window.setPhase2EndDate(request.getEndDate());
            if (request.getDescription() != null) window.setPhase2Description(request.getDescription());
            if (request.getStatus() != null) {
                window.setPhase2Status(request.getStatus());
            } else {
                if (window.getPhase2StartDate() != null && window.getPhase2EndDate() != null) {
                    if (now.isAfter(window.getPhase2StartDate()) && now.isBefore(window.getPhase2EndDate())) {
                        window.setPhase2Status(PhaseStatus.OPEN);
                    } else if (now.isBefore(window.getPhase2StartDate())) {
                        window.setPhase2Status(PhaseStatus.NOT_OPEN);
                    } else if (now.isAfter(window.getPhase2EndDate())) {
                        window.setPhase2Status(PhaseStatus.CLOSED);
                    }
                }
            }
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
