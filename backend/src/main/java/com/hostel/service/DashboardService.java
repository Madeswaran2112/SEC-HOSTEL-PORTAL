package com.hostel.service;

import com.hostel.dto.response.DashboardStatsResponse;
import com.hostel.entity.Room;
import com.hostel.entity.User;
import com.hostel.enums.GroupStatus;
import com.hostel.enums.RoomStatus;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final StudentProfileRepository studentProfileRepository;
    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final StudentGroupRepository groupRepository;
    private final RoomAllocationRepository allocationRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public DashboardStatsResponse getAdminDashboardStats() {
        long totalStudents = studentProfileRepository.count();
        long totalHostels = hostelRepository.count();
        long totalRooms = roomRepository.count();
        long totalGroups = groupRepository.count();
        long totalAllocations = allocationRepository.count();
        
        List<Room> allRooms = roomRepository.findAll();
        long totalBeds = allRooms.stream()
                .mapToLong(r -> r.getRoomType() != null && r.getRoomType().getCapacity() != null ? r.getRoomType().getCapacity() : 0)
                .sum();
        long occupiedBeds = allRooms.stream()
                .mapToLong(r -> r.getOccupiedBeds() != null ? r.getOccupiedBeds() : 0)
                .sum();
        long availableBeds = Math.max(0, totalBeds - occupiedBeds);
        
        long availableRooms = allRooms.stream()
                .filter(r -> r.getStatus() == RoomStatus.AVAILABLE)
                .count();
                
        double occupancyPercentage = totalBeds > 0 ? ((double) occupiedBeds / totalBeds) * 100.0 : 0.0;

        long pendingApplications = groupRepository.findAll().stream()
                .filter(g -> g.getStatus() == GroupStatus.PENDING || g.getStatus() == GroupStatus.FORMING)
                .count();

        long approvedApplications = groupRepository.findAll().stream()
                .filter(g -> g.getStatus() == GroupStatus.APPROVED || g.getStatus() == GroupStatus.VERIFIED)
                .count();

        long readyGroups = groupRepository.findAll().stream()
                .filter(g -> g.getStatus() == GroupStatus.COMPLETE || g.getStatus() == GroupStatus.VERIFIED || g.getStatus() == GroupStatus.APPROVED)
                .count();

        long allocatedStudents = totalAllocations;

        return DashboardStatsResponse.builder()
                .totalStudents(totalStudents)
                .totalHostels(totalHostels)
                .totalRooms(totalRooms)
                .totalBeds(totalBeds)
                .availableBeds(availableBeds)
                .occupiedBeds(occupiedBeds)
                .availableRooms(availableRooms)
                .pendingApplications(pendingApplications)
                .approvedApplications(approvedApplications)
                .readyGroups(readyGroups)
                .allocatedStudents(allocatedStudents)
                .totalGroups(totalGroups)
                .totalAllocations(totalAllocations)
                .occupancyPercentage(occupancyPercentage)
                .build();
    }

    public Map<String, Object> getStudentDashboardStats(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("unreadNotifications", unreadNotifications);
        stats.put("allocationStatus", user.getStudentProfile() != null ? user.getStudentProfile().getAllocationStatus() : null);
        
        return stats;
    }
}