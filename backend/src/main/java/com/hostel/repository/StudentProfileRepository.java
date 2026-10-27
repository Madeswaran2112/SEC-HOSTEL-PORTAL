package com.hostel.repository;

import com.hostel.entity.StudentProfile;
import com.hostel.enums.Gender;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRegisterNumber(String registerNumber);
    Optional<StudentProfile> findByRegisterNumberIgnoreCase(String registerNumber);
    List<StudentProfile> findByGender(Gender gender);
    boolean existsByRegisterNumber(String registerNumber);
    boolean existsByRegisterNumberIgnoreCase(String registerNumber);

    @Query("SELECT s FROM StudentProfile s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(s.registerNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<StudentProfile> searchByNameOrRegisterNumber(@Param("query") String query);
}
