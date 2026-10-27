package com.hostel.repository;

import com.hostel.entity.WaitingPool;
import com.hostel.enums.HostelType;
import com.hostel.enums.WaitlistStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingPoolRepository extends JpaRepository<WaitingPool, Long> {
    List<WaitingPool> findByAllocationWindowId(Long windowId);
    Optional<WaitingPool> findByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
    Optional<WaitingPool> findFirstByStudentIdOrderByJoinedAtDesc(Long studentId);
    List<WaitingPool> findByAllocationWindowIdAndHostelTypePreferenceAndStatusOrderByPriorityAscJoinedAtAsc(
            Long windowId, HostelType hostelType, WaitlistStatus status);
    List<WaitingPool> findByAllocationWindowIdAndHostelTypePreferenceOrderByPriorityAscJoinedAtAsc(
            Long windowId, HostelType hostelType);
    List<WaitingPool> findByAllocationWindowIdOrderByPriorityDescJoinedAtAsc(Long windowId);
    Page<WaitingPool> findByAllocationWindowIdAndHostelTypePreference(
            Long windowId, HostelType hostelType, Pageable pageable);
    Page<WaitingPool> findByAllocationWindowId(Long windowId, Pageable pageable);
    List<WaitingPool> findByStatus(WaitlistStatus status);
    boolean existsByStudentIdAndAllocationWindowIdAndStatusNotIn(
            Long studentId, Long windowId, List<WaitlistStatus> nonActiveStatuses);
    boolean existsByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
}
