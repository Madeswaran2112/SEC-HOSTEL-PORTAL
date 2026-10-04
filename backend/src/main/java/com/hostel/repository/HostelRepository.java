package com.hostel.repository;

import com.hostel.entity.Hostel;
import com.hostel.enums.HostelType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HostelRepository extends JpaRepository<Hostel, Long> {
    List<Hostel> findByHostelType(HostelType hostelType);
    List<Hostel> findByIsActiveTrue();
    java.util.Optional<Hostel> findByNameIgnoreCase(String name);
}
