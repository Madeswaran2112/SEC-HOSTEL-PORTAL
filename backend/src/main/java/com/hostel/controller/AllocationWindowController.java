package com.hostel.controller;

import com.hostel.dto.request.AllocationWindowRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.AllocationWindowResponse;
import com.hostel.enums.AllocationWindowStatus;
import com.hostel.service.AllocationWindowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/allocation-windows")
@RequiredArgsConstructor
public class AllocationWindowController {

    private final AllocationWindowService windowService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> createWindow(@Valid @RequestBody AllocationWindowRequest request) {
        AllocationWindowResponse response = windowService.createWindow(request);
        return new ResponseEntity<>(ApiResponse.success("Allocation window created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AllocationWindowResponse>>> getAllWindows() {
        List<AllocationWindowResponse> response = windowService.getAllWindows();
        return ResponseEntity.ok(ApiResponse.success("Allocation windows retrieved successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> getActiveWindow() {
        AllocationWindowResponse response = windowService.getActiveWindow();
        return ResponseEntity.ok(ApiResponse.success("Active window retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> getWindowById(@PathVariable Long id) {
        AllocationWindowResponse response = windowService.getWindowById(id);
        return ResponseEntity.ok(ApiResponse.success("Allocation window retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> updateWindow(
            @PathVariable Long id, 
            @Valid @RequestBody AllocationWindowRequest request) {
        AllocationWindowResponse response = windowService.updateWindow(id, request);
        return ResponseEntity.ok(ApiResponse.success("Allocation window updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> changeStatus(
            @PathVariable Long id, 
            @RequestParam AllocationWindowStatus status) {
        AllocationWindowResponse response = windowService.changeStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Window status updated successfully", response));
    }

    @PatchMapping("/{id}/phase1-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> changePhase1Status(
            @PathVariable Long id, 
            @RequestParam com.hostel.enums.PhaseStatus status) {
        AllocationWindowResponse response = windowService.changePhase1Status(id, status);
        return ResponseEntity.ok(ApiResponse.success("Phase 1 status updated successfully", response));
    }

    @PatchMapping("/{id}/phase2-status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AllocationWindowResponse>> changePhase2Status(
            @PathVariable Long id, 
            @RequestParam com.hostel.enums.PhaseStatus status) {
        AllocationWindowResponse response = windowService.changePhase2Status(id, status);
        return ResponseEntity.ok(ApiResponse.success("Phase 2 status updated successfully", response));
    }
}
