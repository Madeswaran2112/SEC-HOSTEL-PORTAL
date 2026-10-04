package com.hostel.repository;

import com.hostel.entity.WaitingPool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WaitingPoolRepository extends JpaRepository<WaitingPool, Long> {
    List<WaitingPool> findByAllocationWindowId(Long windowId);
    Optional<WaitingPool> findByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
    List<WaitingPool> findByAllocationWindowIdOrderByPriorityDescJoinedAtAsc(Long windowId);
    List<WaitingPool> findByAllocationWindowIdAndStatusOrderByPriorityDescJoinedAtAsc(Long windowId, com.hostel.enums.ApplicationStatus status);
    List<WaitingPool> findByStatus(com.hostel.enums.ApplicationStatus status);
    List<WaitingPool> findByHostelTypePreferenceAndStatus(com.hostel.enums.HostelType hostelType, com.hostel.enums.ApplicationStatus status);
    boolean existsByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
}
