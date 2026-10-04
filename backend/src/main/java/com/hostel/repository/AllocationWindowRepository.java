package com.hostel.repository;

import com.hostel.entity.AllocationWindow;
import com.hostel.enums.AllocationWindowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AllocationWindowRepository extends JpaRepository<AllocationWindow, Long> {
    List<AllocationWindow> findByStatus(AllocationWindowStatus status);
    Optional<AllocationWindow> findFirstByStatusOrderByStartDateAsc(AllocationWindowStatus status);
}
