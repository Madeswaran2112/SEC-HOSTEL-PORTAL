package com.hostel.service;

import com.hostel.dto.request.AllocationWindowRequest;
import com.hostel.dto.response.AllocationWindowResponse;
import com.hostel.entity.AllocationWindow;
import com.hostel.enums.AllocationWindowStatus;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.AllocationWindowRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
                
        // Could add logic to ensure only one window is OPEN at a time
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
    public AllocationWindowResponse changePhase1Status(Long id, com.hostel.enums.PhaseStatus status) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
        window.setPhase1Status(status);
        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    @Transactional
    public AllocationWindowResponse changePhase2Status(Long id, com.hostel.enums.PhaseStatus status) {
        AllocationWindow window = windowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AllocationWindow", "id", id));
        window.setPhase2Status(status);
        window = windowRepository.save(window);
        return mapToResponse(window);
    }

    private AllocationWindowResponse mapToResponse(AllocationWindow window) {
        return AllocationWindowResponse.builder()
                .id(window.getId())
                .name(window.getName())
                .academicYear(window.getAcademicYear())
                .semester(window.getSemester())
                .startDate(window.getStartDate())
                .endDate(window.getEndDate())
                .status(window.getStatus())
                .phase1Status(window.getPhase1Status() != null ? window.getPhase1Status() : com.hostel.enums.PhaseStatus.NOT_OPEN)
                .phase2Status(window.getPhase2Status() != null ? window.getPhase2Status() : com.hostel.enums.PhaseStatus.NOT_OPEN)
                .createdAt(window.getCreatedAt())
                .build();
    }
}
