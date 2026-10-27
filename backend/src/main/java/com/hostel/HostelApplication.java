package com.hostel;

import com.hostel.entity.AllocationWindow;
import com.hostel.entity.Hostel;
import com.hostel.entity.Room;
import com.hostel.entity.RoomType;
import com.hostel.entity.User;
import com.hostel.enums.AllocationWindowStatus;
import com.hostel.enums.HostelType;
import com.hostel.enums.Role;
import com.hostel.enums.RoomStatus;
import com.hostel.repository.AllocationWindowRepository;
import com.hostel.repository.HostelRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.RoomTypeRepository;
import com.hostel.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

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
            AllocationWindowRepository windowRepository,
            RoomRepository roomRepository) {
        return args -> {
            // Seed Admin Users
            java.util.Optional<User> existingAdmin = userRepository.findByEmailIgnoreCase("admin@hostel.com");
            if (existingAdmin.isEmpty()) {
                userRepository.save(User.builder()
                        .email("admin@hostel.com")
                        .passwordHash(passwordEncoder.encode("Admin@123"))
                        .role(Role.ADMIN)
                        .isActive(true)
                        .emailVerified(true)
                        .build());
            } else {
                User admin = existingAdmin.get();
                if (!Boolean.TRUE.equals(admin.getIsActive()) || admin.getRole() != Role.ADMIN) {
                    admin.setIsActive(true);
                    admin.setRole(Role.ADMIN);
                    admin.setEmailVerified(true);
                    userRepository.save(admin);
                }
            }

            java.util.Optional<User> existingSuperAdmin = userRepository.findByEmailIgnoreCase("superadmin@hostel.com");
            if (existingSuperAdmin.isEmpty()) {
                userRepository.save(User.builder()
                        .email("superadmin@hostel.com")
                        .passwordHash(passwordEncoder.encode("SuperAdmin@123"))
                        .role(Role.SUPER_ADMIN)
                        .isActive(true)
                        .emailVerified(true)
                        .build());
            } else {
                User superAdmin = existingSuperAdmin.get();
                if (!Boolean.TRUE.equals(superAdmin.getIsActive()) || superAdmin.getRole() != Role.SUPER_ADMIN) {
                    superAdmin.setIsActive(true);
                    superAdmin.setRole(Role.SUPER_ADMIN);
                    superAdmin.setEmailVerified(true);
                    userRepository.save(superAdmin);
                }
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
                        .phase1Status(com.hostel.enums.PhaseStatus.OPEN)
                        .phase2Status(com.hostel.enums.PhaseStatus.OPEN)
                        .build());
            }

            // Seed Initial Rooms for Boys & Girls Hostels if empty
            if (roomRepository.count() == 0) {
                hostelRepository.findAll().forEach(hostel -> {
                    List<RoomType> allTypes = roomTypeRepository.findAll();
                    int roomCount = 1;
                    for (int floor = 1; floor <= Math.min(hostel.getTotalFloors(), 3); floor++) {
                        for (RoomType rt : allTypes) {
                            String prefix = (hostel.getHostelType() == HostelType.BOYS) ? "B" : "G";
                            String roomNumber = prefix + "-" + floor + "0" + roomCount++;
                            roomRepository.save(Room.builder()
                                    .hostel(hostel)
                                    .roomType(rt)
                                    .roomNumber(roomNumber)
                                    .building(hostel.getName() + " Block")
                                    .floorNumber(floor)
                                    .status(RoomStatus.AVAILABLE)
                                    .totalCapacity(rt.getCapacity())
                                    .occupiedBeds(0)
                                    .build());
                        }
                    }
                });
            }
        };
    }
}