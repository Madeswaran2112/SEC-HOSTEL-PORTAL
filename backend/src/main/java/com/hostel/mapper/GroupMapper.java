package com.hostel.mapper;

import com.hostel.dto.response.GroupMemberResponse;
import com.hostel.dto.response.GroupResponse;
import com.hostel.dto.response.RoomTypeResponse;
import com.hostel.entity.GroupMembership;
import com.hostel.entity.StudentGroup;

import java.util.List;
import java.util.stream.Collectors;

public class GroupMapper {

    public static GroupResponse toResponse(StudentGroup group, List<GroupMembership> members) {
        if (group == null) {
            return null;
        }

        List<GroupMemberResponse> memberResponses = members != null ? members.stream()
                .map(GroupMapper::toMemberResponse)
                .collect(Collectors.toList()) : null;

        RoomTypeResponse preferredRoomType = null;
        if (group.getPreferredRoomType() != null) {
            preferredRoomType = RoomTypeResponse.builder()
                    .id(group.getPreferredRoomType().getId())
                    .name(group.getPreferredRoomType().getName())
                    .capacity(group.getPreferredRoomType().getCapacity())
                    .isAc(group.getPreferredRoomType().getIsAc())
                    .baseFee(group.getPreferredRoomType().getBaseFee())
                    .isActive(group.getPreferredRoomType().getIsActive())
                    .build();
        }

        return GroupResponse.builder()
                .id(group.getId())
                .groupName(group.getGroupName())
                .leaderId(group.getLeader() != null ? group.getLeader().getId() : null)
                .leaderName(group.getLeader() != null ? group.getLeader().getName() : null)
                .preferredRoomType(preferredRoomType)
                .hostelTypePreference(group.getHostelTypePreference())
                .status(group.getStatus())
                .maxSize(group.getMaxSize())
                .currentSize(members != null ? members.size() : 0)
                .members(memberResponses)
                .createdAt(group.getCreatedAt())
                .build();
    }

    public static GroupMemberResponse toMemberResponse(GroupMembership membership) {
        if (membership == null) {
            return null;
        }

        return GroupMemberResponse.builder()
                .id(membership.getId())
                .studentId(membership.getStudent() != null ? membership.getStudent().getId() : null)
                .studentName(membership.getStudent() != null ? membership.getStudent().getName() : null)
                .registerNumber(membership.getStudent() != null ? membership.getStudent().getRegisterNumber() : null)
                .status(membership.getStatus())
                .invitedAt(membership.getInvitedAt())
                .respondedAt(membership.getRespondedAt())
                .build();
    }
}
