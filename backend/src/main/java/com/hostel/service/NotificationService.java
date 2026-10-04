package com.hostel.service;

import com.hostel.entity.Notification;
import com.hostel.entity.User;
import com.hostel.enums.NotificationType;
import com.hostel.repository.NotificationRepository;
import com.hostel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(Long userId, String title, String message, NotificationType type, String refType, Long refId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(refType)
                .referenceId(refId)
                .isRead(false)
                .build();
                
        notificationRepository.save(notification);
    }
}
