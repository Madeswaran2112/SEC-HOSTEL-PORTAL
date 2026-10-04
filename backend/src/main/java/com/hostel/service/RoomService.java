package com.hostel.service;

import com.hostel.dto.request.RoomRequest;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.RoomResponse;
import com.hostel.entity.Hostel;
import com.hostel.entity.Room;
import com.hostel.entity.RoomType;
import com.hostel.enums.RoomStatus;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.RoomMapper;
import com.hostel.repository.HostelRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.RoomTypeRepository;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final HostelRepository hostelRepository;
    private final RoomTypeRepository roomTypeRepository;

    @Transactional
    public RoomResponse createRoom(RoomRequest request) {
        Hostel hostel = hostelRepository.findById(request.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", request.getHostelId()));

        if (request.getFloorNumber() > hostel.getTotalFloors()) {
            throw new BadRequestException("Floor number cannot exceed total floors of hostel (" + hostel.getTotalFloors() + ")");
        }

        boolean roomExists = roomRepository.findByHostelId(hostel.getId()).stream()
                .anyMatch(r -> r.getRoomNumber().equalsIgnoreCase(request.getRoomNumber()));
        
        if (roomExists) {
            throw new DuplicateResourceException("Room number '" + request.getRoomNumber() + "' already exists in this hostel");
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", request.getRoomTypeId()));

        Room room = RoomMapper.toEntity(request, hostel, roomType);
        room.setStatus(RoomStatus.AVAILABLE);
        room.setOccupiedBeds(0);
        
        room = roomRepository.save(room);
        return RoomMapper.toResponse(room);
    }

    public PagedResponse<RoomResponse> getAllRooms(Long hostelId, RoomStatus status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Room> roomsPage;
        
        // Manual filtering for simplicity in this implementation, normally use Specification
        roomsPage = roomRepository.findAll(pageable); // Placeholder, ideally use a Specification for filtering
        
        List<RoomResponse> content = roomsPage.getContent().stream()
                .filter(r -> (hostelId == null || r.getHostel().getId().equals(hostelId)))
                .filter(r -> (status == null || r.getStatus() == status))
                .map(RoomMapper::toResponse)
                .collect(Collectors.toList());
                
        return PaginationUtil.createPagedResponse(roomsPage, content);
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
        return RoomMapper.toResponse(room);
    }

    @Transactional
    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));

        Hostel hostel = hostelRepository.findById(request.getHostelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", request.getHostelId()));

        if (request.getFloorNumber() > hostel.getTotalFloors()) {
            throw new BadRequestException("Floor number cannot exceed total floors of hostel (" + hostel.getTotalFloors() + ")");
        }

        if (!room.getRoomNumber().equalsIgnoreCase(request.getRoomNumber()) || !room.getHostel().getId().equals(hostel.getId())) {
            boolean roomExists = roomRepository.findByHostelId(hostel.getId()).stream()
                    .anyMatch(r -> r.getRoomNumber().equalsIgnoreCase(request.getRoomNumber()));
            if (roomExists) {
                throw new DuplicateResourceException("Room number '" + request.getRoomNumber() + "' already exists in this hostel");
            }
        }

        RoomType roomType = roomTypeRepository.findById(request.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", request.getRoomTypeId()));
                
        if (roomType.getCapacity() < room.getOccupiedBeds()) {
            throw new BadRequestException("New room type capacity (" + roomType.getCapacity() + ") is less than currently occupied beds (" + room.getOccupiedBeds() + ")");
        }

        room.setHostel(hostel);
        room.setRoomType(roomType);
        room.setRoomNumber(request.getRoomNumber());
        room.setFloorNumber(request.getFloorNumber());

        room = roomRepository.save(room);
        return RoomMapper.toResponse(room);
    }
    
    @Transactional
    public RoomResponse updateRoomStatus(Long id, RoomStatus status) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
                
        if (status == RoomStatus.AVAILABLE && room.getOccupiedBeds() >= room.getRoomType().getCapacity()) {
            room.setStatus(RoomStatus.FULL);
        } else {
            room.setStatus(status);
        }
        
        room = roomRepository.save(room);
        return RoomMapper.toResponse(room);
    }

    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", id));
                
        if (room.getOccupiedBeds() > 0) {
            throw new BadRequestException("Cannot delete room with occupied beds");
        }
        
        roomRepository.delete(room);
    }
}
