package com.hostel.service;

import com.hostel.dto.response.StudentImportResponse;
import com.hostel.entity.StudentProfile;
import com.hostel.entity.User;
import com.hostel.enums.Gender;
import com.hostel.enums.Role;
import com.hostel.enums.StudentAllocationStatus;
import com.hostel.repository.StudentProfileRepository;
import com.hostel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StudentExcelService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public byte[] generateTemplateExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Students Template");

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {
                    "Register Number",
                    "Full Name",
                    "Email",
                    "Department",
                    "Year",
                    "Phone",
                    "Gender (MALE/FEMALE)",
                    "Previous Room Number"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            Object[][] sampleData = {
                    {"2112001", "Arun Kumar", "arun.k@saveetha.ac.in", "CSE", 3, "9876543210", "MALE", "101"},
                    {"2112002", "Priya Sharma", "priya.s@saveetha.ac.in", "ECE", 3, "9876543211", "FEMALE", "G105"},
                    {"2112003", "Karthik Raja", "karthik.r@saveetha.ac.in", "IT", 2, "9876543212", "MALE", "204"}
            };

            for (int r = 0; r < sampleData.length; r++) {
                Row row = sheet.createRow(r + 1);
                for (int c = 0; c < sampleData[r].length; c++) {
                    Cell cell = row.createCell(c);
                    Object val = sampleData[r][c];
                    if (val instanceof Integer) {
                        cell.setCellValue((Integer) val);
                    } else {
                        cell.setCellValue(String.valueOf(val));
                    }
                }
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate students Excel template: " + e.getMessage(), e);
        }
    }

    @Transactional
    public StudentImportResponse importStudentsFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file is empty");
        }

        List<String> errors = new ArrayList<>();
        int importedCount = 0;
        int totalRows = 0;

        Set<String> seenRegisterNumbers = new HashSet<>();
        Set<String> seenEmails = new HashSet<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            int lastRowNum = sheet.getLastRowNum();

            for (int r = 1; r <= lastRowNum; r++) {
                Row row = sheet.getRow(r);
                if (row == null || isRowEmpty(row)) {
                    continue;
                }

                totalRows++;
                int rowNumber = r + 1;

                String regNo = getCellStringValue(row.getCell(0));
                String name = getCellStringValue(row.getCell(1));
                String email = getCellStringValue(row.getCell(2));
                String dept = getCellStringValue(row.getCell(3));
                String yearStr = getCellStringValue(row.getCell(4));
                String phone = getCellStringValue(row.getCell(5));
                String genderStr = getCellStringValue(row.getCell(6));
                String prevRoom = getCellStringValue(row.getCell(7));

                // Validation
                if (regNo.isEmpty()) {
                    errors.add("Row " + rowNumber + ": Register number is missing");
                    continue;
                }
                regNo = regNo.toUpperCase().trim();

                if (seenRegisterNumbers.contains(regNo)) {
                    errors.add("Row " + rowNumber + ": Duplicate register number '" + regNo + "' in upload sheet");
                    continue;
                }
                seenRegisterNumbers.add(regNo);

                if (name.isEmpty()) {
                    errors.add("Row " + rowNumber + ": Full name is missing for " + regNo);
                    continue;
                }

                if (email.isEmpty()) {
                    errors.add("Row " + rowNumber + ": Email is missing for " + regNo);
                    continue;
                }
                email = email.toLowerCase().trim();

                if (seenEmails.contains(email)) {
                    errors.add("Row " + rowNumber + ": Duplicate email '" + email + "' in upload sheet");
                    continue;
                }
                seenEmails.add(email);

                Gender gender;
                try {
                    gender = Gender.valueOf(genderStr.toUpperCase().trim());
                } catch (Exception e) {
                    errors.add("Row " + rowNumber + ": Invalid gender '" + genderStr + "'. Must be MALE or FEMALE");
                    continue;
                }

                int year = 1;
                try {
                    year = (int) Double.parseDouble(yearStr);
                } catch (Exception ignored) {
                }

                // Check database duplicates
                if (studentProfileRepository.existsByRegisterNumberIgnoreCase(regNo)) {
                    errors.add("Row " + rowNumber + ": Register number '" + regNo + "' already exists in database");
                    continue;
                }

                if (userRepository.findByEmail(email).isPresent()) {
                    errors.add("Row " + rowNumber + ": Email '" + email + "' already registered to another user");
                    continue;
                }

                Role role = (gender == Gender.MALE) ? Role.STUDENT : Role.STUDENT;

                User user = User.builder()
                        .email(email)
                        .passwordHash(passwordEncoder.encode("Sec@1234"))
                        .role(role)
                        .isActive(true)
                        .emailVerified(true)
                        .build();

                user = userRepository.save(user);

                StudentProfile profile = StudentProfile.builder()
                        .user(user)
                        .name(name)
                        .registerNumber(regNo)
                        .department(!dept.isEmpty() ? dept : "Engineering")
                        .year(year)
                        .phone(!phone.isEmpty() ? phone : "9876543210")
                        .gender(gender)
                        .previousRoomNumber(!prevRoom.isEmpty() ? prevRoom : null)
                        .allocationStatus(StudentAllocationStatus.NOT_APPLIED)
                        .build();

                studentProfileRepository.save(profile);
                importedCount++;
            }

            return StudentImportResponse.builder()
                    .totalRows(totalRows)
                    .importedCount(importedCount)
                    .errorCount(errors.size())
                    .message("Imported " + importedCount + " students successfully with " + errors.size() + " errors.")
                    .errors(errors)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to process Excel import: " + e.getMessage(), e);
        }
    }

    private boolean isRowEmpty(Row row) {
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK && !getCellStringValue(cell).trim().isEmpty()) {
                return false;
            }
        }
        return true;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                double numericVal = cell.getNumericCellValue();
                if (numericVal == (long) numericVal) {
                    return String.valueOf((long) numericVal);
                }
                return String.valueOf(numericVal);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }
}
