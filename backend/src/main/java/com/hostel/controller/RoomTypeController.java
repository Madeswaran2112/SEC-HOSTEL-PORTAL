package com.hostel.controller;

import com.hostel.dto.request.RoomTypeRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.RoomTypeResponse;
import com.hostel.service.RoomTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> createRoomType(@Valid @RequestBody RoomTypeRequest request) {
        RoomTypeResponse response = roomTypeService.createRoomType(request);
        return new ResponseEntity<>(ApiResponse.success("Room type created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomTypeResponse>>> getAllRoomTypes() {
        List<RoomTypeResponse> response = roomTypeService.getAllRoomTypes();
        return ResponseEntity.ok(ApiResponse.success("Room types retrieved successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<RoomTypeResponse>>> getActiveRoomTypes() {
        List<RoomTypeResponse> response = roomTypeService.getActiveRoomTypes();
        return ResponseEntity.ok(ApiResponse.success("Active room types retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> getRoomTypeById(@PathVariable Long id) {
        RoomTypeResponse response = roomTypeService.getRoomTypeById(id);
        return ResponseEntity.ok(ApiResponse.success("Room type retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<RoomTypeResponse>> updateRoomType(@PathVariable Long id, @Valid @RequestBody RoomTypeRequest request) {
        RoomTypeResponse response = roomTypeService.updateRoomType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Room type updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoomType(@PathVariable Long id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.ok(ApiResponse.success("Room type deactivated successfully", null));
    }
}
