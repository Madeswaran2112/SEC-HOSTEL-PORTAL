package com.hostel.repository;

import com.hostel.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {
    List<RoomType> findByIsActiveTrue();
    List<RoomType> findByCapacity(Integer capacity);
    java.util.Optional<RoomType> findByNameIgnoreCase(String name);
    java.util.Optional<RoomType> findByCapacityAndIsAc(Integer capacity, Boolean isAc);
}
