package com.hostel.dto.response;

import com.hostel.enums.GroupStatus;
import com.hostel.enums.HostelType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {
    private Long id;
    private String groupName;
    private Long leaderId;
    private String leaderName;
    private RoomTypeResponse preferredRoomType;
    private HostelType hostelTypePreference;
    private GroupStatus status;
    private Integer maxSize;
    private Integer currentSize;
    private List<GroupMemberResponse> members;
    private LocalDateTime createdAt;
}
