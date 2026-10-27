package com.hostel.repository;

import com.hostel.entity.PhaseOnePreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PhaseOnePreferenceRepository extends JpaRepository<PhaseOnePreference, Long> {
    Optional<PhaseOnePreference> findByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
    Optional<PhaseOnePreference> findFirstByStudentIdOrderBySubmittedAtDesc(Long studentId);
    List<PhaseOnePreference> findByAllocationWindowId(Long windowId);
    boolean existsByStudentIdAndAllocationWindowId(Long studentId, Long windowId);
}

