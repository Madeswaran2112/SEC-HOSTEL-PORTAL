package com.hostel;

import com.hostel.entity.AllocationWindow;
import com.hostel.entity.Hostel;
import com.hostel.entity.RoomType;
import com.hostel.entity.User;
import com.hostel.enums.AllocationWindowStatus;
import com.hostel.enums.HostelType;
import com.hostel.enums.Role;
import com.hostel.repository.AllocationWindowRepository;
import com.hostel.repository.HostelRepository;
import com.hostel.repository.RoomTypeRepository;
import com.hostel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
public class HostelApplication {

    public static void main(String[] args) {
        SpringApplication.run(HostelApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            HostelRepository hostelRepository,
            RoomTypeRepository roomTypeRepository,
            AllocationWindowRepository windowRepository) {
        return args -> {
            // Seed Admin Users
            if (!userRepository.existsByEmail("admin@hostel.com")) {
                userRepository.save(User.builder()
                        .email("admin@hostel.com")
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .isActive(true)
                        .emailVerified(true)
                        .build());
            }
            if (!userRepository.existsByEmail("superadmin@hostel.com")) {
                userRepository.save(User.builder()
                        .email("superadmin@hostel.com")
                        .passwordHash(passwordEncoder.encode("SuperAdmin@123"))
                        .role(Role.SUPER_ADMIN)
                        .isActive(true)
                        .emailVerified(true)
                        .build());
            }

            // Seed Hostels (Boys Hostel & Girls Hostel)
            if (hostelRepository.count() == 0) {
                hostelRepository.save(Hostel.builder()
                        .name("Boys Hostel")
                        .hostelType(HostelType.BOYS)
                        .address("SEC Campus - Boys Hostel Block")
                        .totalFloors(4)
                        .isActive(true)
                        .build());

                hostelRepository.save(Hostel.builder()
                        .name("Girls Hostel")
                        .hostelType(HostelType.GIRLS)
                        .address("SEC Campus - Girls Hostel Block")
                        .totalFloors(4)
                        .isActive(true)
                        .build());
            }

            // Seed the 10 Standard Room Types
            if (roomTypeRepository.count() == 0) {
                Object[][] types = new Object[][]{
                        {"Single AC", 1, true, new BigDecimal("85000")},
                        {"Single Non-AC", 1, false, new BigDecimal("70000")},
                        {"2-in-1 AC", 2, true, new BigDecimal("75000")},
                        {"2-in-1 Non-AC", 2, false, new BigDecimal("60000")},
                        {"4-in-1 AC", 4, true, new BigDecimal("65000")},
                        {"4-in-1 Non-AC", 4, false, new BigDecimal("50000")},
                        {"8-in-1 AC", 8, true, new BigDecimal("55000")},
                        {"8-in-1 Non-AC", 8, false, new BigDecimal("40000")},
                        {"10-in-1 AC", 10, true, new BigDecimal("45000")},
                        {"10-in-1 Non-AC", 10, false, new BigDecimal("35000")}
                };

                for (Object[] t : types) {
                    roomTypeRepository.save(RoomType.builder()
                            .name((String) t[0])
                            .capacity((Integer) t[1])
                            .isAc((Boolean) t[2])
                            .baseFee((BigDecimal) t[3])
                            .isActive(true)
                            .build());
                }
            }

            // Seed Default Active Allocation Window
            if (windowRepository.count() == 0) {
                windowRepository.save(AllocationWindow.builder()
                        .name("2026-2027 Hostel Allocation")
                        .academicYear("2026-2027")
                        .semester("ODD")
                        .startDate(LocalDateTime.now())
                        .endDate(LocalDateTime.now().plusMonths(6))
                        .status(AllocationWindowStatus.OPEN)
                        .build());
            }
        };
    }
}