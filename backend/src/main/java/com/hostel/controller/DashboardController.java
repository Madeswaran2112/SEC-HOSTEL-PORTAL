package com.hostel.controller;

import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.DashboardStatsResponse;
import com.hostel.security.CurrentUser;
import com.hostel.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getAdminDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getAdminDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", stats));
    }

    @GetMapping("/student")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStudentDashboardStats(@CurrentUser UserDetails userDetails) {
        Map<String, Object> stats = dashboardService.getStudentDashboardStats(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Student dashboard stats retrieved successfully", stats));
    }
}
