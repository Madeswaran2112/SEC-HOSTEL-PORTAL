package com.hostel.controller;

import com.hostel.dto.request.StudentUpdateRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.StudentResponse;
import com.hostel.enums.Gender;
import com.hostel.enums.StudentAllocationStatus;
import com.hostel.security.CurrentUser;
import com.hostel.service.StudentService;
import com.hostel.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping({"/me", "/profile"})
    public ResponseEntity<ApiResponse<StudentResponse>> getCurrentStudentProfile(@CurrentUser UserDetails userDetails) {
        StudentResponse response = studentService.getCurrentStudentProfile(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PutMapping({"/me", "/profile"})
    public ResponseEntity<ApiResponse<StudentResponse>> updateCurrentStudentProfile(
            @CurrentUser UserDetails userDetails,
            @Valid @RequestBody StudentUpdateRequest request) {
        StudentResponse response = studentService.updateCurrentStudentProfile(userDetails, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> getStudentById(@PathVariable Long id) {
        StudentResponse response = studentService.getStudentById(id);
        return ResponseEntity.ok(ApiResponse.success("Student retrieved successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<StudentResponse>>> getAllStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Gender gender,
            @RequestParam(required = false) StudentAllocationStatus allocationStatus,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
            
        PagedResponse<StudentResponse> response = studentService.getAllStudents(
                department, year, gender, allocationStatus, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Students retrieved successfully", response));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<StudentResponse>>> searchStudents(@RequestParam("q") String query) {
        List<StudentResponse> response = studentService.searchStudents(query);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved successfully", response));
    }
    
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentStats() {
        Map<String, Object> stats = studentService.getStudentStats();
        return ResponseEntity.ok(ApiResponse.success("Student stats retrieved successfully", stats));
    }
}
