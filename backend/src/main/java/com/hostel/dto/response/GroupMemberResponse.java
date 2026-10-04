package com.hostel.dto.response;

import com.hostel.enums.MembershipStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private MembershipStatus status;
    private LocalDateTime invitedAt;
    private LocalDateTime respondedAt;
}
