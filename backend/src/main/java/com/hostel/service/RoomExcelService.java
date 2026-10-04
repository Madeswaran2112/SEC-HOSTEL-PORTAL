package com.hostel.service;

import com.hostel.dto.response.ExcelImportResponse;
import com.hostel.dto.response.ExcelPreviewResponse;
import com.hostel.dto.response.ExcelRoomRowDto;
import com.hostel.entity.Hostel;
import com.hostel.entity.Room;
import com.hostel.entity.RoomType;
import com.hostel.enums.HostelType;
import com.hostel.enums.RoomStatus;
import com.hostel.exception.BadRequestException;
import com.hostel.exception.ResourceNotFoundException;
import com.hostel.repository.HostelRepository;
import com.hostel.repository.RoomRepository;
import com.hostel.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RoomExcelService {

    private final HostelRepository hostelRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    public byte[] generateTemplateExcel() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Rooms Template");

            CellStyle headerStyle = workbook.createCellStyle();
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            String[] headers = {
                    "Hostel",
                    "Floor",
                    "Room Number",
                    "Room Type",
                    "AC Status",
                    "Total Capacity",
                    "Available Beds",
                    "Status"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            Object[][] sampleData = {
                    {"Boys Hostel", 1, "101", "4-in-1 AC", "YES", 4, 4, "AVAILABLE"},
                    {"Boys Hostel", 1, "102", "2-in-1 Non-AC", "NO", 2, 2, "AVAILABLE"},
                    {"Boys Hostel", 2, "201", "Single AC", "YES", 1, 1, "AVAILABLE"},
                    {"Girls Hostel", 1, "G101", "4-in-1 AC", "YES", 4, 4, "AVAILABLE"},
                    {"Girls Hostel", 1, "G102", "2-in-1 Non-AC", "NO", 2, 2, "AVAILABLE"},
                    {"Girls Hostel", 2, "G201", "Single AC", "YES", 1, 1, "AVAILABLE"}
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
            throw new RuntimeException("Failed to generate Excel template: " + e.getMessage(), e);
        }
    }

    public ExcelPreviewResponse previewRoomExcel(MultipartFile file, Long hostelId) {
        Hostel defaultHostel = null;
        if (hostelId != null) {
            defaultHostel = hostelRepository.findById(hostelId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", hostelId));
        }

        List<ExcelRoomRowDto> rows = parseFile(file, defaultHostel);

        int validCount = (int) rows.stream().filter(ExcelRoomRowDto::isValid).count();
        int errorCount = rows.size() - validCount;

        return ExcelPreviewResponse.builder()
                .hostelId(defaultHostel != null ? defaultHostel.getId() : null)
                .hostelName(defaultHostel != null ? defaultHostel.getName() : "All Hostels")
                .totalRows(rows.size())
                .validRows(validCount)
                .errorRows(errorCount)
                .rows(rows)
                .build();
    }

    @Transactional
    public ExcelImportResponse importRoomExcel(MultipartFile file, Long hostelId) {
        Hostel defaultHostel = null;
        if (hostelId != null) {
            defaultHostel = hostelRepository.findById(hostelId)
                    .orElseThrow(() -> new ResourceNotFoundException("Hostel", "id", hostelId));
        }

        List<ExcelRoomRowDto> rows = parseFile(file, defaultHostel);
        int importedCount = 0;
        int updatedCount = 0;
        int errorCount = 0;
        List<String> warnings = new ArrayList<>();

        for (ExcelRoomRowDto rowDto : rows) {
            if (!rowDto.isValid()) {
                errorCount++;
                continue;
            }

            try {
                Hostel targetHostel = resolveHostel(rowDto.getHostelName(), defaultHostel);
                if (targetHostel == null) {
                    errorCount++;
                    warnings.add("Row " + rowDto.getRowNumber() + ": Hostel not found for name '" + rowDto.getHostelName() + "'");
                    continue;
                }

                RoomType roomType = resolveOrCreateRoomType(rowDto.getRoomTypeName(), rowDto.getTotalCapacity(), rowDto.getIsAc());
                Optional<Room> existingRoomOpt = roomRepository.findByHostelIdAndRoomNumber(targetHostel.getId(), rowDto.getRoomNumber());

                RoomStatus status = parseStatus(rowDto.getStatus());
                int occupiedBeds = rowDto.getTotalCapacity() - (rowDto.getAvailableBeds() != null ? rowDto.getAvailableBeds() : rowDto.getTotalCapacity());
                if (occupiedBeds >= rowDto.getTotalCapacity()) {
                    status = RoomStatus.FULL;
                }

                if (existingRoomOpt.isPresent()) {
                    Room room = existingRoomOpt.get();
                    room.setFloorNumber(rowDto.getFloorNumber());
                    room.setRoomType(roomType);
                    room.setStatus(status);
                    room.setOccupiedBeds(occupiedBeds);
                    roomRepository.save(room);
                    updatedCount++;
                } else {
                    Room room = Room.builder()
                            .hostel(targetHostel)
                            .roomNumber(rowDto.getRoomNumber())
                            .floorNumber(rowDto.getFloorNumber())
                            .roomType(roomType)
                            .status(status)
                            .occupiedBeds(occupiedBeds)
                            .build();
                    roomRepository.save(room);
                    importedCount++;
                }
            } catch (Exception ex) {
                errorCount++;
                warnings.add("Row " + rowDto.getRowNumber() + " (" + rowDto.getRoomNumber() + "): " + ex.getMessage());
            }
        }

        return ExcelImportResponse.builder()
                .hostelId(defaultHostel != null ? defaultHostel.getId() : null)
                .hostelName(defaultHostel != null ? defaultHostel.getName() : "All Hostels")
                .importedCount(importedCount)
                .updatedCount(updatedCount)
                .errorCount(errorCount)
                .message("Successfully processed " + (importedCount + updatedCount) + " rooms.")
                .warnings(warnings)
                .build();
    }

    private List<ExcelRoomRowDto> parseFile(MultipartFile file, Hostel defaultHostel) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded Excel file is empty");
        }

        String fileName = file.getOriginalFilename();
        if (fileName != null && fileName.toLowerCase().endsWith(".csv")) {
            return parseCsvFile(file, defaultHostel);
        }
        return parseExcelWorkbook(file, defaultHostel);
    }

    private List<ExcelRoomRowDto> parseExcelWorkbook(MultipartFile file, Hostel defaultHostel) {
        List<ExcelRoomRowDto> dtoList = new ArrayList<>();
        Set<String> seenRooms = new HashSet<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            if (sheet == null) {
                throw new BadRequestException("No sheet found in Excel workbook");
            }

            Iterator<Row> rowIterator = sheet.rowIterator();
            if (!rowIterator.hasNext()) {
                throw new BadRequestException("Excel file is empty");
            }

            Row headerRow = rowIterator.next();
            Map<String, Integer> colMap = mapHeaders(headerRow);

            int rowIdx = 1;
            while (rowIterator.hasNext()) {
                rowIdx++;
                Row row = rowIterator.next();
                if (isRowEmpty(row)) continue;

                List<String> errors = new ArrayList<>();

                String hostelName = getCellStringValue(row, colMap.get("hostel"));
                if (hostelName == null || hostelName.isBlank()) {
                    hostelName = defaultHostel != null ? defaultHostel.getName() : "Boys Hostel";
                }

                Hostel targetHostel = resolveHostel(hostelName, defaultHostel);
                if (targetHostel == null) {
                    errors.add("Unknown hostel: '" + hostelName + "' (specify Boys Hostel or Girls Hostel)");
                }

                Integer floorNumber = getCellIntegerValue(row, colMap.get("floor"));
                if (floorNumber == null) {
                    errors.add("Floor is required");
                } else if (floorNumber < 0 || (targetHostel != null && floorNumber > targetHostel.getTotalFloors())) {
                    int maxF = targetHostel != null ? targetHostel.getTotalFloors() : 10;
                    errors.add("Floor " + floorNumber + " is invalid (hostel has " + maxF + " floors)");
                }

                String roomNumber = getCellStringValue(row, colMap.get("roomnumber"));
                if (roomNumber == null || roomNumber.isBlank()) {
                    errors.add("Room Number is required");
                } else {
                    roomNumber = roomNumber.trim();
                    String uniqueKey = (targetHostel != null ? targetHostel.getName() : hostelName) + "_" + roomNumber;
                    if (seenRooms.contains(uniqueKey)) {
                        errors.add("Duplicate Room Number '" + roomNumber + "' in file for " + hostelName);
                    } else {
                        seenRooms.add(uniqueKey);
                    }
                }

                String roomTypeName = getCellStringValue(row, colMap.get("roomtype"));
                Boolean isAc = getCellBooleanValue(row, colMap.get("isac"));
                if (isAc == null && roomTypeName != null) {
                    String lower = roomTypeName.toLowerCase();
                    if (lower.contains("non-ac") || lower.contains("non ac")) isAc = false;
                    else if (lower.contains("ac")) isAc = true;
                }
                if (isAc == null) isAc = false;

                Integer totalCapacity = getCellIntegerValue(row, colMap.get("capacity"));
                if (totalCapacity == null && roomTypeName != null) {
                    totalCapacity = inferCapacityFromName(roomTypeName);
                }
                if (totalCapacity == null || totalCapacity <= 0) {
                    errors.add("Total Capacity must be greater than 0");
                    totalCapacity = 1;
                }

                Integer availableBeds = getCellIntegerValue(row, colMap.get("availablebeds"));
                if (availableBeds == null) {
                    availableBeds = totalCapacity;
                } else if (availableBeds < 0 || availableBeds > totalCapacity) {
                    errors.add("Available beds (" + availableBeds + ") cannot exceed capacity (" + totalCapacity + ")");
                }

                String status = getCellStringValue(row, colMap.get("status"));
                if (status == null || status.isBlank()) {
                    status = availableBeds == 0 ? "FULL" : "AVAILABLE";
                }

                if (roomTypeName == null || roomTypeName.isBlank()) {
                    roomTypeName = totalCapacity == 1 ? "Single " + (isAc ? "AC" : "Non-AC") : totalCapacity + "-in-1 " + (isAc ? "AC" : "Non-AC");
                }

                ExcelRoomRowDto dto = ExcelRoomRowDto.builder()
                        .rowNumber(rowIdx)
                        .hostelName(targetHostel != null ? targetHostel.getName() : hostelName)
                        .floorNumber(floorNumber)
                        .roomNumber(roomNumber)
                        .roomTypeName(roomTypeName)
                        .isAc(isAc)
                        .totalCapacity(totalCapacity)
                        .availableBeds(availableBeds)
                        .status(status.toUpperCase())
                        .valid(errors.isEmpty())
                        .errors(errors)
                        .build();

                dtoList.add(dto);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read Excel file: " + e.getMessage());
        }

        return dtoList;
    }

    private List<ExcelRoomRowDto> parseCsvFile(MultipartFile file, Hostel defaultHostel) {
        List<ExcelRoomRowDto> dtoList = new ArrayList<>();
        Set<String> seenRooms = new HashSet<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null || headerLine.isBlank()) {
                throw new BadRequestException("CSV file is empty");
            }

            String[] headers = parseCsvLine(headerLine);
            Map<String, Integer> colMap = new HashMap<>();
            for (int i = 0; i < headers.length; i++) {
                String normalized = headers[i].toLowerCase().replaceAll("[^a-z0-9]", "");
                if (normalized.contains("hostel")) colMap.put("hostel", i);
                else if (normalized.contains("floor")) colMap.put("floor", i);
                else if (normalized.contains("roomno") || normalized.contains("roomnumber") || normalized.equals("room")) colMap.put("roomnumber", i);
                else if (normalized.contains("roomtype") || normalized.equals("type")) colMap.put("roomtype", i);
                else if (normalized.contains("nonac") || normalized.contains("isac") || normalized.equals("ac")) colMap.put("isac", i);
                else if (normalized.contains("capacity") || normalized.contains("totalbed") || normalized.contains("beds")) colMap.put("capacity", i);
                else if (normalized.contains("available") || normalized.contains("freebed") || normalized.contains("vacant")) colMap.put("availablebeds", i);
                else if (normalized.contains("status")) colMap.put("status", i);
            }

            String line;
            int rowIdx = 1;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                rowIdx++;
                String[] tokens = parseCsvLine(line);
                List<String> errors = new ArrayList<>();

                String hostelName = getCsvValue(tokens, colMap.get("hostel"));
                if (hostelName == null || hostelName.isBlank()) {
                    hostelName = defaultHostel != null ? defaultHostel.getName() : "Boys Hostel";
                }

                Hostel targetHostel = resolveHostel(hostelName, defaultHostel);
                if (targetHostel == null) {
                    errors.add("Unknown hostel: '" + hostelName + "' (specify Boys Hostel or Girls Hostel)");
                }

                Integer floorNumber = getCsvIntValue(tokens, colMap.get("floor"));
                if (floorNumber == null) {
                    errors.add("Floor is required");
                } else if (floorNumber < 0 || (targetHostel != null && floorNumber > targetHostel.getTotalFloors())) {
                    int maxF = targetHostel != null ? targetHostel.getTotalFloors() : 10;
                    errors.add("Floor " + floorNumber + " is invalid (hostel has " + maxF + " floors)");
                }

                String roomNumber = getCsvValue(tokens, colMap.get("roomnumber"));
                if (roomNumber == null || roomNumber.isBlank()) {
                    errors.add("Room Number is required");
                } else {
                    roomNumber = roomNumber.trim();
                    String uniqueKey = (targetHostel != null ? targetHostel.getName() : hostelName) + "_" + roomNumber;
                    if (seenRooms.contains(uniqueKey)) {
                        errors.add("Duplicate Room Number '" + roomNumber + "' in file for " + hostelName);
                    } else {
                        seenRooms.add(uniqueKey);
                    }
                }

                String roomTypeName = getCsvValue(tokens, colMap.get("roomtype"));
                Boolean isAc = getCsvBoolValue(tokens, colMap.get("isac"));
                if (isAc == null && roomTypeName != null) {
                    String lower = roomTypeName.toLowerCase();
                    if (lower.contains("non-ac") || lower.contains("non ac")) isAc = false;
                    else if (lower.contains("ac")) isAc = true;
                }
                if (isAc == null) isAc = false;

                Integer totalCapacity = getCsvIntValue(tokens, colMap.get("capacity"));
                if (totalCapacity == null && roomTypeName != null) {
                    totalCapacity = inferCapacityFromName(roomTypeName);
                }
                if (totalCapacity == null || totalCapacity <= 0) {
                    errors.add("Total Capacity must be greater than 0");
                    totalCapacity = 1;
                }

                Integer availableBeds = getCsvIntValue(tokens, colMap.get("availablebeds"));
                if (availableBeds == null) {
                    availableBeds = totalCapacity;
                } else if (availableBeds < 0 || availableBeds > totalCapacity) {
                    errors.add("Available beds (" + availableBeds + ") cannot exceed capacity (" + totalCapacity + ")");
                }

                String status = getCsvValue(tokens, colMap.get("status"));
                if (status == null || status.isBlank()) {
                    status = availableBeds == 0 ? "FULL" : "AVAILABLE";
                }

                if (roomTypeName == null || roomTypeName.isBlank()) {
                    roomTypeName = totalCapacity == 1 ? "Single " + (isAc ? "AC" : "Non-AC") : totalCapacity + "-in-1 " + (isAc ? "AC" : "Non-AC");
                }

                dtoList.add(ExcelRoomRowDto.builder()
                        .rowNumber(rowIdx)
                        .hostelName(targetHostel != null ? targetHostel.getName() : hostelName)
                        .floorNumber(floorNumber)
                        .roomNumber(roomNumber)
                        .roomTypeName(roomTypeName)
                        .isAc(isAc)
                        .totalCapacity(totalCapacity)
                        .availableBeds(availableBeds)
                        .status(status.toUpperCase())
                        .valid(errors.isEmpty())
                        .errors(errors)
                        .build());
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        return dtoList;
    }

    private Hostel resolveHostel(String hostelName, Hostel defaultHostel) {
        if (defaultHostel != null) return defaultHostel;
        if (hostelName == null || hostelName.isBlank()) return null;

        String name = hostelName.trim();
        Optional<Hostel> byName = hostelRepository.findByNameIgnoreCase(name);
        if (byName.isPresent()) return byName.get();

        String lower = name.toLowerCase();
        if (lower.contains("boy")) {
            List<Hostel> boys = hostelRepository.findByHostelType(HostelType.BOYS);
            if (!boys.isEmpty()) return boys.get(0);
        } else if (lower.contains("girl")) {
            List<Hostel> girls = hostelRepository.findByHostelType(HostelType.GIRLS);
            if (!girls.isEmpty()) return girls.get(0);
        }

        List<Hostel> all = hostelRepository.findAll();
        return all.isEmpty() ? null : all.get(0);
    }

    private Map<String, Integer> mapHeaders(Row headerRow) {
        Map<String, Integer> map = new HashMap<>();
        for (Cell cell : headerRow) {
            String value = cell.getStringCellValue();
            if (value == null) continue;
            String normalized = value.toLowerCase().replaceAll("[^a-z0-9]", "");
            int colIdx = cell.getColumnIndex();

            if (normalized.contains("hostel")) map.put("hostel", colIdx);
            else if (normalized.contains("floor")) map.put("floor", colIdx);
            else if (normalized.contains("roomno") || normalized.contains("roomnumber") || normalized.equals("room")) map.put("roomnumber", colIdx);
            else if (normalized.contains("roomtype") || normalized.equals("type")) map.put("roomtype", colIdx);
            else if (normalized.contains("nonac") || normalized.contains("isac") || normalized.equals("ac")) map.put("isac", colIdx);
            else if (normalized.contains("capacity") || normalized.contains("totalbed") || normalized.contains("beds")) map.put("capacity", colIdx);
            else if (normalized.contains("available") || normalized.contains("freebed") || normalized.contains("vacant")) map.put("availablebeds", colIdx);
            else if (normalized.contains("status")) map.put("status", colIdx);
        }
        return map;
    }

    private RoomType resolveOrCreateRoomType(String name, Integer capacity, Boolean isAc) {
        if (name != null && !name.isBlank()) {
            Optional<RoomType> byName = roomTypeRepository.findByNameIgnoreCase(name.trim());
            if (byName.isPresent()) {
                return byName.get();
            }
        }

        Optional<RoomType> byCapAc = roomTypeRepository.findByCapacityAndIsAc(capacity, isAc);
        if (byCapAc.isPresent()) {
            return byCapAc.get();
        }

        String autoName = capacity == 1 
                ? "Single " + (isAc ? "AC" : "Non-AC") 
                : capacity + "-in-1 " + (isAc ? "AC" : "Non-AC");

        Optional<RoomType> autoNamedOpt = roomTypeRepository.findByNameIgnoreCase(autoName);
        if (autoNamedOpt.isPresent()) {
            return autoNamedOpt.get();
        }

        BigDecimal fee = BigDecimal.valueOf(capacity <= 2 ? 75000 : (capacity <= 4 ? 60000 : 45000));
        RoomType newType = RoomType.builder()
                .name(autoName)
                .capacity(capacity)
                .isAc(isAc)
                .baseFee(fee)
                .isActive(true)
                .build();
        return roomTypeRepository.save(newType);
    }

    private RoomStatus parseStatus(String statusStr) {
        if (statusStr == null) return RoomStatus.AVAILABLE;
        String s = statusStr.trim().toUpperCase();
        if (s.contains("FULL") || s.contains("OCCUPIED")) return RoomStatus.FULL;
        if (s.contains("MAINT")) return RoomStatus.MAINTENANCE;
        if (s.contains("BLOCK")) return RoomStatus.BLOCKED;
        return RoomStatus.AVAILABLE;
    }

    private Integer inferCapacityFromName(String name) {
        String lower = name.toLowerCase();
        if (lower.contains("single") || lower.contains("1-in-1")) return 1;
        if (lower.contains("2-in-1") || lower.contains("double")) return 2;
        if (lower.contains("3-in-1") || lower.contains("triple")) return 3;
        if (lower.contains("4-in-1") || lower.contains("four")) return 4;
        if (lower.contains("6-in-1") || lower.contains("six")) return 6;
        if (lower.contains("8-in-1") || lower.contains("eight")) return 8;
        if (lower.contains("10-in-1") || lower.contains("ten")) return 10;
        return null;
    }

    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int c = row.getFirstCellNum(); c < row.getLastCellNum(); c++) {
            Cell cell = row.getCell(c);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                return false;
            }
        }
        return true;
    }

    private String getCellStringValue(Row row, Integer colIdx) {
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            long val = (long) cell.getNumericCellValue();
            return String.valueOf(val);
        } else if (cell.getCellType() == CellType.BOOLEAN) {
            return String.valueOf(cell.getBooleanCellValue());
        }
        return null;
    }

    private Integer getCellIntegerValue(Row row, Integer colIdx) {
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            try {
                return Integer.parseInt(cell.getStringCellValue().trim());
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private Boolean getCellBooleanValue(Row row, Integer colIdx) {
        if (colIdx == null) return null;
        Cell cell = row.getCell(colIdx);
        if (cell == null) return null;
        if (cell.getCellType() == CellType.BOOLEAN) {
            return cell.getBooleanCellValue();
        } else if (cell.getCellType() == CellType.STRING) {
            String str = cell.getStringCellValue().trim().toLowerCase();
            if (str.equals("true") || str.equals("yes") || str.equals("ac") || str.equals("y") || str.equals("1")) return true;
            if (str.equals("false") || str.equals("no") || str.contains("non") || str.equals("n") || str.equals("0")) return false;
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return cell.getNumericCellValue() > 0;
        }
        return null;
    }

    private String[] parseCsvLine(String line) {
        List<String> list = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;
        for (char c : line.toCharArray()) {
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                list.add(sb.toString().trim());
                sb.setLength(0);
            } else {
                sb.append(c);
            }
        }
        list.add(sb.toString().trim());
        return list.toArray(new String[0]);
    }

    private String getCsvValue(String[] tokens, Integer idx) {
        if (idx == null || idx < 0 || idx >= tokens.length) return null;
        String val = tokens[idx].trim();
        if (val.startsWith("\"") && val.endsWith("\"") && val.length() >= 2) {
            val = val.substring(1, val.length() - 1).trim();
        }
        return val.isEmpty() ? null : val;
    }

    private Integer getCsvIntValue(String[] tokens, Integer idx) {
        String val = getCsvValue(tokens, idx);
        if (val == null) return null;
        try {
            return Integer.parseInt(val);
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    private Boolean getCsvBoolValue(String[] tokens, Integer idx) {
        String val = getCsvValue(tokens, idx);
        if (val == null) return null;
        String s = val.toLowerCase();
        if (s.equals("true") || s.equals("yes") || s.equals("ac") || s.equals("y") || s.equals("1")) return true;
        if (s.equals("false") || s.equals("no") || s.contains("non") || s.equals("n") || s.equals("0")) return false;
        return null;
    }
}