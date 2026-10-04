package com.hostel.controller;

import com.hostel.dto.request.ManualAllocationRequest;
import com.hostel.dto.response.AllocationResponse;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.enums.AllocationStatus;
import com.hostel.security.CurrentUser;
import com.hostel.service.AllocationService;
import com.hostel.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/allocations")
@RequiredArgsConstructor
public class AllocationController {

    private final AllocationService allocationService;

    @PostMapping("/auto-run/{windowId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> runAutoAllocation(@PathVariable Long windowId) {
        Map<String, Object> result = allocationService.runAutoAllocation(windowId);
        return ResponseEntity.ok(ApiResponse.success("Auto-allocation completed", result));
    }

    @PostMapping("/manual")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<AllocationResponse>> manualAllocation(
            @RequestParam Long windowId, 
            @Valid @RequestBody ManualAllocationRequest request) {
        AllocationResponse response = allocationService.manualAllocation(windowId, request);
        return new ResponseEntity<>(ApiResponse.success("Manual allocation successful", response), HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<AllocationResponse>>> getAllocations(
            @RequestParam(required = false) Long windowId,
            @RequestParam(required = false) AllocationStatus status,
            @RequestParam(required = false) Long hostelId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<AllocationResponse> response = allocationService.getAllocations(windowId, status, hostelId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Allocations retrieved successfully", response));
    }

    @GetMapping("/my-allocation")
    public ResponseEntity<ApiResponse<AllocationResponse>> getMyAllocation(
            @RequestParam Long windowId, 
            @CurrentUser UserDetails userDetails) {
        AllocationResponse response = allocationService.getMyAllocation(windowId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Allocation retrieved successfully", response));
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptAllocation(@PathVariable Long id, @CurrentUser UserDetails userDetails) {
        allocationService.acceptAllocation(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Allocation accepted successfully", null));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectAllocation(@PathVariable Long id, @CurrentUser UserDetails userDetails) {
        allocationService.rejectAllocation(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Allocation rejected successfully", null));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> cancelAllocation(@PathVariable Long id) {
        allocationService.cancelAllocation(id);
        return ResponseEntity.ok(ApiResponse.success("Allocation cancelled successfully", null));
    }
}
