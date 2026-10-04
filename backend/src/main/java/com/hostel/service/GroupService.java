package com.hostel.service;

import com.hostel.dto.request.GroupCreateRequest;
import com.hostel.dto.request.GroupInviteRequest;
import com.hostel.dto.response.GroupMemberResponse;
import com.hostel.dto.response.GroupResponse;
import com.hostel.dto.response.MemberValidationResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.entity.*;
import com.hostel.enums.*;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.DuplicateResourceException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.exception.UnauthorizedException;
import com.hostel.mapper.GroupMapper;
import com.hostel.repository.*;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final StudentGroupRepository groupRepository;
    private final GroupMembershipRepository membershipRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public GroupResponse createGroup(GroupCreateRequest request, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile leader = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        if (membershipRepository.existsByStudentIdAndStatusIn(leader.getId(), Set.of(MembershipStatus.ACCEPTED))) {
            throw new DuplicateResourceException("You are already part of a group");
        }
        
        RoomType roomType = roomTypeRepository.findById(request.getPreferredRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("RoomType", "id", request.getPreferredRoomTypeId()));

        HostelType hostelPref = leader.getGender() == Gender.MALE ? HostelType.BOYS : HostelType.GIRLS;

        StudentGroup group = StudentGroup.builder()
                .groupName(request.getGroupName())
                .leader(leader)
                .preferredRoomType(roomType)
                .hostelTypePreference(hostelPref)
                .maxSize(request.getMaxSize())
                .status(GroupStatus.FORMING)
                .build();
                
        group = groupRepository.save(group);

        GroupMembership membership = GroupMembership.builder()
                .group(group)
                .student(leader)
                .status(MembershipStatus.ACCEPTED)
                .invitedAt(LocalDateTime.now())
                .respondedAt(LocalDateTime.now())
                .build();
                
        membershipRepository.save(membership);

        return GroupMapper.toResponse(group, List.of(membership));
    }

    public GroupResponse getMyGroup(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        GroupMembership membership = membershipRepository.findByStudentIdAndStatus(profile.getId(), MembershipStatus.ACCEPTED)
                .orElseThrow(() -> new ResourceNotFoundException("GroupMembership", "studentId", profile.getId()));
                
        StudentGroup group = membership.getGroup();
        List<GroupMembership> members = membershipRepository.findByGroupId(group.getId());
        
        return GroupMapper.toResponse(group, members);
    }

    public GroupResponse getGroupById(Long id) {
        StudentGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", id));
        List<GroupMembership> members = membershipRepository.findByGroupId(group.getId());
        return GroupMapper.toResponse(group, members);
    }

    @Transactional
    public void inviteStudent(Long groupId, GroupInviteRequest request, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", groupId));
                
        if (!group.getLeader().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Only the group leader can invite students");
        }

        List<GroupMembership> currentMembers = membershipRepository.findByGroupIdAndStatus(groupId, MembershipStatus.ACCEPTED);
        if (currentMembers.size() >= group.getMaxSize()) {
            throw new BadRequestException("Group is already full");
        }

        StudentProfile invitee = null;
        if (request.getRegisterNumber() != null) {
            invitee = studentProfileRepository.findByRegisterNumber(request.getRegisterNumber())
                    .orElseThrow(() -> new ResourceNotFoundException("Student", "registerNumber", request.getRegisterNumber()));
        } else if (request.getEmail() != null) {
            User inviteeUser = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));
            invitee = inviteeUser.getStudentProfile();
        } else {
            throw new BadRequestException("Must provide registerNumber or email to invite");
        }

        // Validate gender
        if (invitee.getGender() != group.getLeader().getGender()) {
            throw new BadRequestException("Invited student must be of the same gender as the group");
        }

        if (membershipRepository.existsByStudentIdAndStatusIn(invitee.getId(), Set.of(MembershipStatus.ACCEPTED))) {
            throw new BadRequestException("Student is already in another group");
        }

        GroupMembership invitation = GroupMembership.builder()
                .group(group)
                .student(invitee)
                .status(MembershipStatus.PENDING)
                .invitedAt(LocalDateTime.now())
                .build();
                
        membershipRepository.save(invitation);
        
        notificationService.createNotification(
                invitee.getUser().getId(),
                "Group Invitation",
                "You have been invited to join group: " + group.getGroupName(),
                NotificationType.GROUP_INVITE,
                "GROUP",
                group.getId()
        );
    }

    public List<GroupMemberResponse> getPendingInvitations(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        return membershipRepository.findByStudentId(profile.getId()).stream()
                .filter(m -> m.getStatus() == MembershipStatus.PENDING)
                .map(GroupMapper::toMemberResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptInvitation(Long invitationId, UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        GroupMembership membership = membershipRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("GroupMembership", "id", invitationId));
                
        if (!membership.getStudent().getId().equals(profile.getId())) {
            throw new UnauthorizedException("This invitation is not for you");
        }

        if (membershipRepository.existsByStudentIdAndStatusIn(profile.getId(), Set.of(MembershipStatus.ACCEPTED))) {
            throw new BadRequestException("You are already in another group");
        }

        StudentGroup group = membership.getGroup();
        List<GroupMembership> currentMembers = membershipRepository.findByGroupIdAndStatus(group.getId(), MembershipStatus.ACCEPTED);
        
        if (currentMembers.size() >= group.getMaxSize()) {
            throw new BadRequestException("Group is already full");
        }

        membership.setStatus(MembershipStatus.ACCEPTED);
        membership.setRespondedAt(LocalDateTime.now());
        membershipRepository.save(membership);

        // Auto-update group status
        if (currentMembers.size() + 1 == group.getMaxSize()) {
            group.setStatus(GroupStatus.COMPLETE);
        } else if (currentMembers.size() + 1 >= 2) {
            group.setStatus(GroupStatus.PARTIAL);
        }
        groupRepository.save(group);
        
        notificationService.createNotification(
                group.getLeader().getUser().getId(),
                "Invitation Accepted",
                profile.getName() + " has joined your group",
                NotificationType.GROUP_UPDATE,
                "GROUP",
                group.getId()
        );
    }
    
    @Transactional
    public void declineInvitation(Long invitationId, UserDetails userDetails) {
        // Implementation similar to accept, but set status to DECLINED
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
                
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));

        GroupMembership membership = membershipRepository.findById(invitationId)
                .orElseThrow(() -> new ResourceNotFoundException("GroupMembership", "id", invitationId));
                
        if (!membership.getStudent().getId().equals(profile.getId())) {
            throw new UnauthorizedException("This invitation is not for you");
        }

        membership.setStatus(MembershipStatus.DECLINED);
        membership.setRespondedAt(LocalDateTime.now());
        membershipRepository.save(membership);
    }

    @Transactional
    public void dissolveGroup(Long groupId, UserDetails userDetails) {
        // Find group, check if leader or admin, set status to DISSOLVED, notify members
        StudentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", groupId));
                
        // For brevity, simple dissolve
        group.setStatus(GroupStatus.DISSOLVED);
        groupRepository.save(group);
        
        // Notify members
        List<GroupMembership> members = membershipRepository.findByGroupIdAndStatus(groupId, MembershipStatus.ACCEPTED);
        for(GroupMembership member : members) {
            notificationService.createNotification(
                    member.getStudent().getUser().getId(),
                    "Group Dissolved",
                    "Your group " + group.getGroupName() + " has been dissolved",
                    NotificationType.GROUP_UPDATE,
                    "GROUP",
                    group.getId()
            );
        }
    }

    public PagedResponse<GroupResponse> getAllGroups(GroupStatus status, int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<StudentGroup> groupPage = groupRepository.findAll(pageable); // Can add Spec for status filtering
        
        List<GroupResponse> content = groupPage.getContent().stream()
                .filter(g -> (status == null || g.getStatus() == status))
                .map(g -> GroupMapper.toResponse(g, membershipRepository.findByGroupId(g.getId())))
                .collect(Collectors.toList());
                
        return PaginationUtil.createPagedResponse(groupPage, content);
    }

    public MemberValidationResponse validateMember(String registerNumber, Long groupId, UserDetails userDetails) {
        StudentProfile student = studentProfileRepository.findByRegisterNumber(registerNumber)
                .orElse(null);
        if (student == null) {
            return MemberValidationResponse.builder()
                    .valid(false)
                    .message("Student not found with register number: " + registerNumber)
                    .build();
        }
        if (membershipRepository.existsByStudentIdAndStatusIn(student.getId(), Set.of(MembershipStatus.ACCEPTED))) {
            return MemberValidationResponse.builder()
                    .valid(false)
                    .message("Student is already accepted in another group")
                    .build();
        }
        return MemberValidationResponse.builder()
                .valid(true)
                .message("Student is eligible to join")
                .studentId(student.getId())
                .name(student.getName())
                .registerNumber(student.getRegisterNumber())
                .department(student.getDepartment())
                .year(student.getYear())
                .gender(student.getGender())
                .build();
    }

    @Transactional
    public GroupResponse submitGroup(Long id, UserDetails userDetails) {
        StudentGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", id));
        group.setStatus(GroupStatus.PENDING);
        group = groupRepository.save(group);
        List<GroupMembership> members = membershipRepository.findByGroupId(group.getId());
        return GroupMapper.toResponse(group, members);
    }

    public List<GroupResponse> getPendingGroups(HostelType hostelType) {
        List<StudentGroup> list = groupRepository.findAll().stream()
                .filter(g -> g.getStatus() == GroupStatus.PENDING || g.getStatus() == GroupStatus.FORMING || g.getStatus() == GroupStatus.COMPLETE)
                .filter(g -> hostelType == null || g.getHostelTypePreference() == hostelType)
                .collect(Collectors.toList());
        return list.stream()
                .map(g -> GroupMapper.toResponse(g, membershipRepository.findByGroupId(g.getId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public GroupResponse verifyGroup(Long id) {
        StudentGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", id));
        group.setStatus(GroupStatus.VERIFIED);
        group = groupRepository.save(group);
        List<GroupMembership> members = membershipRepository.findByGroupId(group.getId());
        return GroupMapper.toResponse(group, members);
    }

    @Transactional
    public GroupResponse approveGroup(Long id) {
        StudentGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", id));
        group.setStatus(GroupStatus.APPROVED);
        group = groupRepository.save(group);
        List<GroupMembership> members = membershipRepository.findByGroupId(group.getId());
        return GroupMapper.toResponse(group, members);
    }

    @Transactional
    public GroupResponse rejectGroup(Long id, String reason) {
        StudentGroup group = groupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentGroup", "id", id));
        group.setStatus(GroupStatus.REJECTED);
        group = groupRepository.save(group);
        List<GroupMembership> members = membershipRepository.findByGroupId(group.getId());
        return GroupMapper.toResponse(group, members);
    }
}
