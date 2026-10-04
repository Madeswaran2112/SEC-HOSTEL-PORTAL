package com.hostel.mapper;

import com.hostel.dto.response.StudentResponse;
import com.hostel.entity.StudentProfile;
import com.hostel.entity.User;

import java.util.List;
import java.util.stream.Collectors;

public class StudentMapper {

    public static StudentResponse toResponse(StudentProfile studentProfile, User user) {
        if (user == null) {
            return null;
        }

        if (studentProfile == null) {
            return StudentResponse.builder()
                    .userId(user.getId())
                    .email(user.getEmail())
                    .name(user.getEmail().split("@")[0])
                    .role(user.getRole() != null ? "ROLE_" + user.getRole().name() : "ROLE_ADMIN")
                    .build();
        }
        
        return StudentResponse.builder()
                .id(studentProfile.getId())
                .userId(user.getId())
                .name(studentProfile.getName())
                .registerNumber(studentProfile.getRegisterNumber())
                .department(studentProfile.getDepartment())
                .year(studentProfile.getYear())
                .email(user.getEmail())
                .phone(studentProfile.getPhone())
                .gender(studentProfile.getGender())
                .allocationStatus(studentProfile.getAllocationStatus())
                .role(user.getRole() != null ? "ROLE_" + user.getRole().name() : "ROLE_STUDENT")
                .createdAt(studentProfile.getCreatedAt())
                .build();
    }

    public static List<StudentResponse> toResponseList(List<StudentProfile> studentProfiles) {
        if (studentProfiles == null) {
            return null;
        }
        
        return studentProfiles.stream()
                .map(sp -> toResponse(sp, sp.getUser()))
                .collect(Collectors.toList());
    }
}
