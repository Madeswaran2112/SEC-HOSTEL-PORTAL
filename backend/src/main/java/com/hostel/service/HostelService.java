package com.hostel.service;

import com.hostel.dto.request.HostelRequest;
import com.hostel.dto.response.HostelResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.entity.Hostel;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.HostelMapper;
import com.hostel.repository.HostelRepository;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostelService {

    private final HostelRepository hostelRepository;

    @Transactional
    public HostelResponse createHostel(HostelRequest request) {
        if (hostelRepository.findAll().stream().anyMatch(h -> h.getName().equalsIgnoreCase(request.getName()))) {
            throw new DuplicateResourceException("Hostel with name '" + request.getName() + "' already exists");
        }

        Hostel hostel = HostelMapper.toEntity(request);
        hostel = hostelRepository.save(hostel);
        return HostelMapper.toResponse(hostel);
    }

    @Transactional(readOnly = true)
    public PagedResponse<HostelResponse> getAllHostels(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Hostel> hostelsPage = hostelRepository.findAll(pageable);
        List<HostelResponse> content = hostelsPage.getContent().stream()
                .map(HostelMapper::toResponse)
                .collect(Collectors.toList());
                
        return PaginationUtil.createPagedResponse(hostelsPage, content);
    }

    @Transactional(readOnly = true)
    public HostelResponse getHostelById(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));
        return HostelMapper.toResponse(hostel);
    }

    @Transactional
    public HostelResponse updateHostel(Long id, HostelRequest request) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));

        if (!hostel.getName().equalsIgnoreCase(request.getName()) && 
            hostelRepository.findAll().stream().anyMatch(h -> h.getName().equalsIgnoreCase(request.getName()))) {
            throw new DuplicateResourceException("Hostel with name '" + request.getName() + "' already exists");
        }

        hostel.setName(request.getName());
        hostel.setHostelType(request.getHostelType());
        hostel.setAddress(request.getAddress());
        hostel.setTotalFloors(request.getTotalFloors());

        hostel = hostelRepository.save(hostel);
        return HostelMapper.toResponse(hostel);
    }

    @Transactional
    public void deleteHostel(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));
        hostel.setIsActive(false);
        hostelRepository.save(hostel);
    }

    public Map<String, Object> getHostelStats(Long id) {
        Hostel hostel = hostelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", id));
                
        int totalRooms = hostel.getRooms() != null ? hostel.getRooms().size() : 0;
        long availableRooms = hostel.getRooms() != null ? 
            hostel.getRooms().stream().filter(r -> "AVAILABLE".equals(r.getStatus().name())).count() : 0;
            
        int totalCapacity = hostel.getRooms() != null ? 
            hostel.getRooms().stream().mapToInt(r -> r.getRoomType().getCapacity()).sum() : 0;
            
        int totalOccupied = hostel.getRooms() != null ? 
            hostel.getRooms().stream().mapToInt(r -> r.getOccupiedBeds() != null ? r.getOccupiedBeds() : 0).sum() : 0;
            
        double occupancyPercentage = totalCapacity > 0 ? ((double) totalOccupied / totalCapacity) * 100 : 0.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRooms", totalRooms);
        stats.put("availableRooms", availableRooms);
        stats.put("totalCapacity", totalCapacity);
        stats.put("totalOccupiedBeds", totalOccupied);
        stats.put("occupancyPercentage", occupancyPercentage);
        
        return stats;
    }
}
