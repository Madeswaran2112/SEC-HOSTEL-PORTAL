package com.hostel.service;

import com.hostel.dto.request.RoomTypeRequest;
import com.hostel.dto.response.RoomTypeResponse;
import com.hostel.entity.RoomType;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    @Transactional
    public RoomTypeResponse createRoomType(RoomTypeRequest request) {
        RoomType roomType = RoomType.builder()
                .name(request.getName())
                .capacity(request.getCapacity())
                .isAc(request.getIsAc())
                .baseFee(request.getBaseFee())
                .isActive(true)
                .build();
                
        roomType = roomTypeRepository.save(roomType);
        return mapToResponse(roomType);
    }

    public List<RoomTypeResponse> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public List<RoomTypeResponse> getActiveRoomTypes() {
        return roomTypeRepository.findByIsActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomTypeResponse getRoomTypeById(Long id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", id));
        return mapToResponse(roomType);
    }

    @Transactional
    public RoomTypeResponse updateRoomType(Long id, RoomTypeRequest request) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", id));

        roomType.setName(request.getName());
        roomType.setCapacity(request.getCapacity());
        roomType.setIsAc(request.getIsAc());
        roomType.setBaseFee(request.getBaseFee());

        roomType = roomTypeRepository.save(roomType);
        return mapToResponse(roomType);
    }

    @Transactional
    public void deleteRoomType(Long id) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", id));
        roomType.setIsActive(false);
        roomTypeRepository.save(roomType);
    }
    
    private RoomTypeResponse mapToResponse(RoomType roomType) {
        return RoomTypeResponse.builder()
                .id(roomType.getId())
                .name(roomType.getName())
                .capacity(roomType.getCapacity())
                .isAc(roomType.getIsAc())
                .baseFee(roomType.getBaseFee())
                .isActive(roomType.getIsActive())
                .build();
    }
}
