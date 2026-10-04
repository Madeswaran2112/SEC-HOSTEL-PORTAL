package com.hostel.controller;

import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.NotificationResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.entity.Notification;
import com.hostel.entity.User;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.NotificationMapper;
import com.hostel.repository.NotificationRepository;
import com.hostel.repository.UserRepository;
import com.hostel.security.CurrentUser;
import com.hostel.util.AppConstants;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getUserNotifications(
            @CurrentUser UserDetails userDetails,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
            
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        List<Notification> allNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        // Manual pagination
        int start = Math.min((int)PageRequest.of(page, size).getOffset(), allNotifications.size());
        int end = Math.min((start + size), allNotifications.size());
        List<Notification> pageContent = allNotifications.subList(start, end);
        
        Page<Notification> notificationPage = new PageImpl<>(pageContent, PageRequest.of(page, size), allNotifications.size());
        
        List<NotificationResponse> content = notificationPage.getContent().stream()
                .map(NotificationMapper::toResponse)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", PaginationUtil.createPagedResponse(notificationPage, content)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@CurrentUser UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        long count = notificationRepository.countByUserIdAndIsReadFalse(user.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id, @CurrentUser UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", id));
                
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new com.hostel.exception.UnauthorizedException("Not authorized to modify this notification");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
        
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@CurrentUser UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
        
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }
}
