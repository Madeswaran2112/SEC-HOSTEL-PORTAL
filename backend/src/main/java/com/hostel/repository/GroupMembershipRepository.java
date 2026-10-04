package com.hostel.repository;

import com.hostel.entity.GroupMembership;
import com.hostel.enums.MembershipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface GroupMembershipRepository extends JpaRepository<GroupMembership, Long> {
    List<GroupMembership> findByGroupId(Long groupId);
    List<GroupMembership> findByStudentId(Long studentId);
    Optional<GroupMembership> findByStudentIdAndStatus(Long studentId, MembershipStatus status);
    List<GroupMembership> findByGroupIdAndStatus(Long groupId, MembershipStatus status);
    boolean existsByStudentIdAndStatusIn(Long studentId, Set<MembershipStatus> statuses);
    boolean existsByGroupIdAndStudentId(Long groupId, Long studentId);
}
