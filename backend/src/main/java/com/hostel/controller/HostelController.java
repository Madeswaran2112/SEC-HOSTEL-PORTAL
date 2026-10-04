package com.hostel.controller;

import com.hostel.dto.request.HostelRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.HostelResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.service.HostelService;
import com.hostel.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hostels")
@RequiredArgsConstructor
public class HostelController {

    private final HostelService hostelService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HostelResponse>> createHostel(@Valid @RequestBody HostelRequest request) {
        HostelResponse response = hostelService.createHostel(request);
        return new ResponseEntity<>(ApiResponse.success("Hostel created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<HostelResponse>>> getAllHostels(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PagedResponse<HostelResponse> response = hostelService.getAllHostels(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Hostels retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HostelResponse>> getHostelById(@PathVariable Long id) {
        HostelResponse response = hostelService.getHostelById(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<HostelResponse>> updateHostel(@PathVariable Long id, @Valid @RequestBody HostelRequest request) {
        HostelResponse response = hostelService.updateHostel(id, request);
        return ResponseEntity.ok(ApiResponse.success("Hostel updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteHostel(@PathVariable Long id) {
        hostelService.deleteHostel(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel deactivated successfully", null));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHostelStats(@PathVariable Long id) {
        Map<String, Object> stats = hostelService.getHostelStats(id);
        return ResponseEntity.ok(ApiResponse.success("Hostel stats retrieved successfully", stats));
    }
}
