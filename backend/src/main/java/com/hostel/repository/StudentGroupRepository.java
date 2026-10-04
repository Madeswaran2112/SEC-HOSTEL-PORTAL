package com.hostel.repository;

import com.hostel.entity.StudentGroup;
import com.hostel.enums.GroupStatus;
import com.hostel.enums.HostelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentGroupRepository extends JpaRepository<StudentGroup, Long> {
    Optional<StudentGroup> findByLeaderId(Long leaderId);
    List<StudentGroup> findByStatus(GroupStatus status);
    List<StudentGroup> findByHostelTypePreferenceAndStatus(HostelType hostelType, GroupStatus status);
}
