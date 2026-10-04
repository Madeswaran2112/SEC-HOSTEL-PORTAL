package com.hostel.controller;

import com.hostel.dto.request.WaitingPoolJoinRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.WaitingPoolResponse;
import com.hostel.security.CurrentUser;
import com.hostel.service.WaitingPoolService;
import com.hostel.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/waiting-pool")
@RequiredArgsConstructor
public class WaitingPoolController {

    private final WaitingPoolService waitingPoolService;

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<WaitingPoolResponse>> joinPool(
            @Valid @RequestBody WaitingPoolJoinRequest request,
            @CurrentUser UserDetails userDetails) {
        WaitingPoolResponse response = waitingPoolService.joinPool(request, userDetails);
        return new ResponseEntity<>(ApiResponse.success("Successfully joined the waiting pool", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leavePool(
            @RequestParam Long windowId,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.leavePool(windowId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Successfully left the waiting pool", null));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<WaitingPoolResponse>> getMyStatus(
            @RequestParam Long windowId,
            @CurrentUser UserDetails userDetails) {
        WaitingPoolResponse response = waitingPoolService.getMyStatus(windowId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Status retrieved successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<WaitingPoolResponse>>> getAllInPool(
            @RequestParam Long windowId,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<WaitingPoolResponse> response = waitingPoolService.getAllInPool(windowId, page, size);
        return ResponseEntity.ok(ApiResponse.success("Waiting pool retrieved successfully", response));
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updatePriority(
            @PathVariable Long id,
            @RequestParam Integer priority) {
        waitingPoolService.updatePriority(id, priority);
        return ResponseEntity.ok(ApiResponse.success("Priority updated successfully", null));
    }
}
