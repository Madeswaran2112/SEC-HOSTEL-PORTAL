package com.hostel.controller;

import com.hostel.dto.request.WaitingPoolJoinRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.WaitingPoolResponse;
import com.hostel.enums.HostelType;
import com.hostel.enums.WaitlistStatus;
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
        return new ResponseEntity<>(ApiResponse.success("Successfully joined the waiting list", response), HttpStatus.CREATED);
    }

    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leavePool(
            @RequestParam(required = false) Long windowId,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.leavePool(windowId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Successfully left the waiting list", null));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<WaitingPoolResponse>> getMyStatus(
            @RequestParam(required = false) Long windowId,
            @CurrentUser UserDetails userDetails) {
        WaitingPoolResponse response = waitingPoolService.getMyStatus(windowId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Status retrieved successfully", response));
    }

    @PostMapping("/accept-offer")
    public ResponseEntity<ApiResponse<WaitingPoolResponse>> acceptOffer(
            @RequestParam Long poolEntryId,
            @CurrentUser UserDetails userDetails) {
        WaitingPoolResponse response = waitingPoolService.acceptOffer(poolEntryId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Room offer accepted successfully! Room allocated.", response));
    }

    @PostMapping("/decline-offer")
    public ResponseEntity<ApiResponse<Void>> declineOffer(
            @RequestParam Long poolEntryId,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.declineOffer(poolEntryId, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Room offer declined.", null));
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<WaitingPoolResponse>>> getAdminWaitlist(
            @RequestParam(required = false) Long windowId,
            @RequestParam(required = false) HostelType hostelType,
            @RequestParam(required = false) WaitlistStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        PagedResponse<WaitingPoolResponse> response = waitingPoolService.getAdminWaitlist(windowId, hostelType, status, search, page, size);
        return ResponseEntity.ok(ApiResponse.success("Waiting list retrieved successfully", response));
    }

    @PostMapping("/{id}/issue-offer")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminIssueOffer(
            @PathVariable Long id,
            @RequestParam Long roomId,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.adminIssueOffer(id, roomId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Room offer issued to candidate successfully", null));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminCancelEntry(
            @PathVariable Long id,
            @RequestParam String reason,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.adminCancelEntry(id, reason, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Waiting list entry cancelled successfully", null));
    }

    @PutMapping("/{id}/priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminUpdatePriority(
            @PathVariable Long id,
            @RequestParam Integer priority,
            @RequestParam(required = false, defaultValue = "Admin priority reorder") String reason,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.adminUpdatePriority(id, priority, reason, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Priority updated successfully", null));
    }

    @PostMapping("/{id}/exceptional-allocate")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> adminExceptionalAllocate(
            @PathVariable Long id,
            @RequestParam Long roomId,
            @RequestParam String reason,
            @CurrentUser UserDetails userDetails) {
        waitingPoolService.adminExceptionalAllocate(id, roomId, reason, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Exceptional room allocation completed successfully", null));
    }
}
