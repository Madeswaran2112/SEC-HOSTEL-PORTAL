package com.hostel.controller;

import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.AuditLogResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.service.AuditLogService;
import com.hostel.util.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<AuditLogResponse> response = auditLogService.getAuditLogs(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getAuditLogById(@PathVariable Long id) {
        AuditLogResponse response = auditLogService.getAuditLogById(id);
        return ResponseEntity.ok(ApiResponse.success("Audit log retrieved successfully", response));
    }
}
