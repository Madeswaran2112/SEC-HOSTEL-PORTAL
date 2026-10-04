package com.hostel.controller;

import com.hostel.dto.request.GroupCreateRequest;
import com.hostel.dto.request.GroupInviteRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.GroupMemberResponse;
import com.hostel.dto.response.GroupResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.MemberValidationResponse;
import com.hostel.enums.GroupStatus;
import com.hostel.enums.HostelType;
import com.hostel.security.CurrentUser;
import com.hostel.service.GroupService;
import com.hostel.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Valid @RequestBody GroupCreateRequest request,
            @CurrentUser UserDetails userDetails) {
        GroupResponse response = groupService.createGroup(request, userDetails);
        return new ResponseEntity<>(ApiResponse.success("Group created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my-group")
    public ResponseEntity<ApiResponse<GroupResponse>> getMyGroup(@CurrentUser UserDetails userDetails) {
        GroupResponse response = groupService.getMyGroup(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Group retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GroupResponse>> getGroupById(@PathVariable Long id) {
        GroupResponse response = groupService.getGroupById(id);
        return ResponseEntity.ok(ApiResponse.success("Group retrieved successfully", response));
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<ApiResponse<Void>> inviteStudent(
            @PathVariable Long id,
            @Valid @RequestBody GroupInviteRequest request,
            @CurrentUser UserDetails userDetails) {
        groupService.inviteStudent(id, request, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Invitation sent successfully", null));
    }

    @GetMapping("/invitations")
    public ResponseEntity<ApiResponse<List<GroupMemberResponse>>> getPendingInvitations(@CurrentUser UserDetails userDetails) {
        List<GroupMemberResponse> responses = groupService.getPendingInvitations(userDetails);
        return ResponseEntity.ok(ApiResponse.success("Invitations retrieved successfully", responses));
    }

    @PutMapping("/invitations/{id}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptInvitation(
            @PathVariable Long id,
            @CurrentUser UserDetails userDetails) {
        groupService.acceptInvitation(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Invitation accepted successfully", null));
    }

    @PutMapping("/invitations/{id}/decline")
    public ResponseEntity<ApiResponse<Void>> declineInvitation(
            @PathVariable Long id,
            @CurrentUser UserDetails userDetails) {
        groupService.declineInvitation(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Invitation declined successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> dissolveGroup(
            @PathVariable Long id,
            @CurrentUser UserDetails userDetails) {
        groupService.dissolveGroup(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Group dissolved successfully", null));
    }

    @GetMapping("/validate-member")
    public ResponseEntity<ApiResponse<MemberValidationResponse>> validateMember(
            @RequestParam String registerNumber,
            @RequestParam(required = false) Long groupId,
            @CurrentUser UserDetails userDetails) {
        MemberValidationResponse response = groupService.validateMember(registerNumber, groupId, userDetails);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<GroupResponse>> submitGroup(
            @PathVariable Long id,
            @CurrentUser UserDetails userDetails) {
        GroupResponse response = groupService.submitGroup(id, userDetails);
        return ResponseEntity.ok(ApiResponse.success("Group application submitted successfully", response));
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<GroupResponse>>> getPendingGroups(
            @RequestParam(required = false) HostelType hostelType) {
        List<GroupResponse> list = groupService.getPendingGroups(hostelType);
        return ResponseEntity.ok(ApiResponse.success("Pending groups retrieved successfully", list));
    }

    @PutMapping("/{id}/verify")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<GroupResponse>> verifyGroup(@PathVariable Long id) {
        GroupResponse response = groupService.verifyGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Group verified successfully", response));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<GroupResponse>> approveGroup(@PathVariable Long id) {
        GroupResponse response = groupService.approveGroup(id);
        return ResponseEntity.ok(ApiResponse.success("Group approved successfully", response));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<GroupResponse>> rejectGroup(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Group requirements not met") String reason) {
        GroupResponse response = groupService.rejectGroup(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Group rejected", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PagedResponse<GroupResponse>>> getAllGroups(
            @RequestParam(required = false) GroupStatus status,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PagedResponse<GroupResponse> response = groupService.getAllGroups(status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Groups retrieved successfully", response));
    }
}
