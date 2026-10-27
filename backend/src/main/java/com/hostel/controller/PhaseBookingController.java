package com.hostel.controller;

import com.hostel.dto.request.PhaseOnePreferenceRequest;
import com.hostel.dto.request.PhaseTwoBookingRequest;
import com.hostel.dto.request.ValidateRoommateRequest;
import com.hostel.dto.response.*;
import com.hostel.security.CurrentUser;
import com.hostel.service.PhaseBookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class PhaseBookingController {

    private final PhaseBookingService bookingService;

    // Student Phase 1: Submit room type preference
    @PostMapping("/phase1")
    public ResponseEntity<ApiResponse<PhaseOnePreferenceResponse>> submitPhaseOnePreference(
            @CurrentUser UserDetails userDetails,
            @Valid @RequestBody PhaseOnePreferenceRequest request) {
        PhaseOnePreferenceResponse response = bookingService.submitPhaseOnePreference(userDetails, request);
        return new ResponseEntity<>(ApiResponse.success("Phase 1 room type preference saved successfully", response), HttpStatus.CREATED);
    }

    // Student Phase 1: Get student's submitted preference
    @GetMapping("/phase1")
    public ResponseEntity<ApiResponse<PhaseOnePreferenceResponse>> getMyPhaseOnePreference(
            @CurrentUser UserDetails userDetails) {
        PhaseOnePreferenceResponse response = bookingService.getMyPhaseOnePreference(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Preference retrieved successfully", response));
    }

    // Student Phase 2: Get eligible available rooms with remaining capacity
    @GetMapping("/phase2/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAvailableRoomsForPhaseTwo(
            @CurrentUser UserDetails userDetails,
            @RequestParam(required = false) Integer floorNumber,
            @RequestParam(required = false) Long roomTypeId,
            @RequestParam(required = false) Boolean isAc) {
        List<RoomResponse> rooms = bookingService.getAvailableRoomsForPhaseTwo(userDetails, floorNumber, roomTypeId, isAc);
        return ResponseEntity.ok(ApiResponse.success("Available rooms retrieved successfully", rooms));
    }

    // Student Phase 2: Validate roommate register number
    @PostMapping("/phase2/validate-roommate")
    public ResponseEntity<ApiResponse<ValidateRoommateResponse>> validateRoommate(
            @CurrentUser UserDetails userDetails,
            @Valid @RequestBody ValidateRoommateRequest request) {
        ValidateRoommateResponse response = bookingService.validateRoommate(userDetails, request.getRegisterNumber());
        return ResponseEntity.ok(ApiResponse.success("Roommate validation completed", response));
    }

    // Student Phase 2: Atomic room booking with roommates
    @PostMapping("/phase2/book")
    public ResponseEntity<ApiResponse<PhaseTwoBookingResponse>> bookRoomPhaseTwo(
            @CurrentUser UserDetails userDetails,
            @Valid @RequestBody PhaseTwoBookingRequest request) {
        PhaseTwoBookingResponse response = bookingService.bookRoomPhaseTwo(userDetails, request);
        return new ResponseEntity<>(ApiResponse.success("Room booked successfully!", response), HttpStatus.CREATED);
    }

    // Combined Phase 1 & Phase 2 status for student dashboard
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<BookingStatusResponse>> getMyBookingStatus(
            @CurrentUser UserDetails userDetails) {
        BookingStatusResponse response = bookingService.getMyBookingStatus(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Booking status retrieved successfully", response));
    }

    // Admin: View all Phase 1 submissions
    @GetMapping("/admin/phase1-submissions")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<PhaseOnePreferenceResponse>>> getPhaseOneSubmissions(
            @RequestParam(required = false) Long windowId) {
        List<PhaseOnePreferenceResponse> response = bookingService.getAllPhaseOneSubmissions(windowId);
        return ResponseEntity.ok(ApiResponse.success("Phase 1 submissions retrieved successfully", response));
    }

    // Admin: View all Phase 2 room selections
    @GetMapping("/admin/phase2-selections")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<AllocationResponse>>> getPhaseTwoSelections(
            @RequestParam(required = false) Long windowId) {
        List<AllocationResponse> response = bookingService.getAllPhaseTwoSelections(windowId);
        return ResponseEntity.ok(ApiResponse.success("Phase 2 selections retrieved successfully", response));
    }
}
