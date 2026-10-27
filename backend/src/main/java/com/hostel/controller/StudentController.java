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
    private final com.hostel.service.StudentExcelService studentExcelService;

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

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> createStudent(
            @Valid @RequestBody com.hostel.dto.request.AdminStudentCreateRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return new ResponseEntity<>(ApiResponse.success("Student created successfully", response), org.springframework.http.HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<StudentResponse>> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody com.hostel.dto.request.AdminStudentCreateRequest request) {
        StudentResponse response = studentService.updateStudent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }

    @GetMapping("/template/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<byte[]> downloadStudentsTemplate() {
        byte[] excelBytes = studentExcelService.generateTemplateExcel();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students_template.xlsx\"")
                .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping(value = "/import/excel", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<com.hostel.dto.response.StudentImportResponse>> importStudentsExcel(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        com.hostel.dto.response.StudentImportResponse response = studentExcelService.importStudentsFromExcel(file);
        return ResponseEntity.ok(ApiResponse.success("Students Excel processed successfully", response));
    }
}
