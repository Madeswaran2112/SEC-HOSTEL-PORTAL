package com.hostel.service;

import com.hostel.dto.request.StudentUpdateRequest;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.StudentResponse;
import com.hostel.entity.RoomAllocation;
import com.hostel.entity.StudentProfile;
import com.hostel.entity.User;
import com.hostel.enums.Gender;
import com.hostel.enums.StudentAllocationStatus;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.mapper.StudentMapper;
import com.hostel.repository.StudentProfileRepository;
import com.hostel.repository.UserRepository;
import com.hostel.repository.RoomAllocationRepository;
import com.hostel.util.PaginationUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final RoomAllocationRepository roomAllocationRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public StudentResponse getCurrentStudentProfile(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));
                
        return StudentMapper.toResponse(profile, user);
    }

    @Transactional
    public StudentResponse updateCurrentStudentProfile(UserDetails userDetails, StudentUpdateRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userDetails.getUsername()));
        
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "userId", user.getId()));
                
        if (request.getName() != null) profile.setName(request.getName());
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());
        if (request.getYear() != null) profile.setYear(request.getYear());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        
        profile = studentProfileRepository.save(profile);
        return StudentMapper.toResponse(profile, user);
    }

    public StudentResponse getStudentById(Long id) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));
        return StudentMapper.toResponse(profile, profile.getUser());
    }

    public PagedResponse<StudentResponse> getAllStudents(
            String department, Integer year, Gender gender, StudentAllocationStatus allocationStatus,
            int page, int size, String sortBy, String sortDir) {
            
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<StudentProfile> studentsPage = studentProfileRepository.findAll(pageable); // Should use Specification
        
        List<StudentResponse> content = studentsPage.getContent().stream()
                .filter(s -> (department == null || s.getDepartment().equalsIgnoreCase(department)))
                .filter(s -> (year == null || s.getYear().equals(year)))
                .filter(s -> (gender == null || s.getGender() == gender))
                .filter(s -> (allocationStatus == null || s.getAllocationStatus() == allocationStatus))
                .map(s -> StudentMapper.toResponse(s, s.getUser()))
                .collect(Collectors.toList());
                
        return PaginationUtil.createPagedResponse(studentsPage, content);
    }

    public List<StudentResponse> searchStudents(String query) {
        List<StudentProfile> profiles = studentProfileRepository.searchByNameOrRegisterNumber(query);
        return profiles.stream()
                .map(s -> StudentMapper.toResponse(s, s.getUser()))
                .collect(Collectors.toList());
    }
    
    public Map<String, Object> getStudentStats() {
        List<StudentProfile> allStudents = studentProfileRepository.findAll();
        
        long totalStudents = allStudents.size();
        long unallocated = allStudents.stream().filter(s -> s.getAllocationStatus() == StudentAllocationStatus.NOT_APPLIED).count();
        long inPool = allStudents.stream().filter(s -> s.getAllocationStatus() == StudentAllocationStatus.IN_POOL).count();
        long allocated = allStudents.stream().filter(s -> s.getAllocationStatus() == StudentAllocationStatus.ALLOCATED || s.getAllocationStatus() == StudentAllocationStatus.CONFIRMED).count();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", totalStudents);
        stats.put("unallocated", unallocated);
        stats.put("inPool", inPool);
        stats.put("allocated", allocated);
        
        return stats;
    }

    @Transactional
    public StudentResponse createStudent(com.hostel.dto.request.AdminStudentCreateRequest request) {
        String reg = request.getRegisterNumber().trim().toUpperCase();
        if (studentProfileRepository.existsByRegisterNumberIgnoreCase(reg)) {
            throw new com.hostel.exception.DuplicateResourceException("Student with register number '" + reg + "' already exists");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new com.hostel.exception.DuplicateResourceException("User with email '" + email + "' already exists");
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().isBlank()) 
                ? request.getPassword() : "Sec@1234";

        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(com.hostel.enums.Role.STUDENT)
                .isActive(true)
                .emailVerified(true)
                .build();
        user = userRepository.save(user);

        StudentProfile profile = StudentProfile.builder()
                .user(user)
                .name(request.getName().trim())
                .registerNumber(reg)
                .department(request.getDepartment().trim())
                .year(request.getYear())
                .phone(request.getPhone().trim())
                .gender(request.getGender())
                .previousRoomNumber(request.getPreviousRoomNumber())
                .allocationStatus(StudentAllocationStatus.NOT_APPLIED)
                .build();
        profile = studentProfileRepository.save(profile);

        return StudentMapper.toResponse(profile, user);
    }

    @Transactional
    public StudentResponse updateStudent(Long id, com.hostel.dto.request.AdminStudentCreateRequest request) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));
        User user = profile.getUser();

        String reg = request.getRegisterNumber().trim().toUpperCase();
        if (!profile.getRegisterNumber().equalsIgnoreCase(reg) && studentProfileRepository.existsByRegisterNumberIgnoreCase(reg)) {
            throw new com.hostel.exception.DuplicateResourceException("Register number '" + reg + "' is already taken by another student");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (!user.getEmail().equalsIgnoreCase(email) && userRepository.findByEmail(email).isPresent()) {
            throw new com.hostel.exception.DuplicateResourceException("Email '" + email + "' is already taken");
        }

        user.setEmail(email);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        user = userRepository.save(user);

        profile.setName(request.getName().trim());
        profile.setRegisterNumber(reg);
        profile.setDepartment(request.getDepartment().trim());
        profile.setYear(request.getYear());
        profile.setPhone(request.getPhone().trim());
        profile.setGender(request.getGender());
        profile.setPreviousRoomNumber(request.getPreviousRoomNumber());
        profile = studentProfileRepository.save(profile);

        return StudentMapper.toResponse(profile, user);
    }

    @Transactional
    public void deleteStudent(Long id) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("StudentProfile", "id", id));

        List<RoomAllocation> allocations = roomAllocationRepository.findByStudentId(id);
        if (!allocations.isEmpty()) {
            throw new com.hostel.exception.BadRequestException("Cannot delete student with active room allocations.");
        }

        User user = profile.getUser();
        studentProfileRepository.delete(profile);
        if (user != null) {
            userRepository.delete(user);
        }
    }
}
