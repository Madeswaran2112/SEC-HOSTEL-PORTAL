package com.hostel.service;

import com.hostel.entity.RoomAllocation;
import com.hostel.entity.StudentProfile;
import com.hostel.enums.AllocationStatus;
import com.hostel.repository.RoomAllocationRepository;
import com.hostel.repository.StudentProfileRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final RoomAllocationRepository allocationRepository;
    private final StudentProfileRepository studentProfileRepository;

    private List<RoomAllocation> getFilteredAllocations(Long windowId) {
        List<RoomAllocation> all = windowId != null 
                ? allocationRepository.findByAllocationWindowId(windowId) 
                : allocationRepository.findAll();

        return all.stream()
                .filter(a -> a.getStatus() != AllocationStatus.CANCELLED && a.getStatus() != AllocationStatus.REJECTED)
                .collect(Collectors.toList());
    }

    public ByteArrayInputStream exportAllocationsToCsv(Long windowId) {
        List<RoomAllocation> allocations = getFilteredAllocations(windowId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT.withHeader(
                     "ID", "Student Name", "Register Number", "Hostel", "Room Type", "Room Number", "Floor", "Bed", "Status"
             ))) {

            for (RoomAllocation a : allocations) {
                csvPrinter.printRecord(
                        a.getId(),
                        a.getStudent() != null ? a.getStudent().getName() : "",
                        a.getStudent() != null ? a.getStudent().getRegisterNumber() : "",
                        a.getRoom() != null && a.getRoom().getHostel() != null ? a.getRoom().getHostel().getName() : "",
                        a.getRoom() != null && a.getRoom().getRoomType() != null ? a.getRoom().getRoomType().getName() : "",
                        a.getRoom() != null ? a.getRoom().getRoomNumber() : "",
                        a.getRoom() != null ? a.getRoom().getFloorNumber() : "",
                        a.getBedNumber(),
                        a.getStatus() != null ? a.getStatus().name() : ""
                );
            }

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export data to CSV file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportAllocationsToExcel(Long windowId) {
        List<RoomAllocation> allocations = getFilteredAllocations(windowId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Allocations");

            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Student Name", "Register Number", "Hostel", "Room Type", "Room Number", "Floor", "Bed", "Status"};
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (RoomAllocation a : allocations) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(a.getId() != null ? a.getId() : 0);
                row.createCell(1).setCellValue(a.getStudent() != null ? a.getStudent().getName() : "");
                row.createCell(2).setCellValue(a.getStudent() != null ? a.getStudent().getRegisterNumber() : "");
                row.createCell(3).setCellValue(a.getRoom() != null && a.getRoom().getHostel() != null ? a.getRoom().getHostel().getName() : "");
                row.createCell(4).setCellValue(a.getRoom() != null && a.getRoom().getRoomType() != null ? a.getRoom().getRoomType().getName() : "");
                row.createCell(5).setCellValue(a.getRoom() != null ? a.getRoom().getRoomNumber() : "");
                row.createCell(6).setCellValue(a.getRoom() != null && a.getRoom().getFloorNumber() != null ? a.getRoom().getFloorNumber() : 0);
                row.createCell(7).setCellValue(a.getBedNumber() != null ? a.getBedNumber() : 0);
                row.createCell(8).setCellValue(a.getStatus() != null ? a.getStatus().name() : "");
            }

            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export data to Excel file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportAllocationsToPdf(Long windowId) {
        List<RoomAllocation> allocations = getFilteredAllocations(windowId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph title = new Paragraph("SEC Hostel - Room Allocations Report", fontTitle);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);
            
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(9);
            table.setWidthPercentage(100);
            
            String[] headers = {"ID", "Student", "Reg No", "Hostel", "Type", "Room", "Floor", "Bed", "Status"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell();
                cell.setPhrase(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
                table.addCell(cell);
            }

            for (RoomAllocation a : allocations) {
                table.addCell(String.valueOf(a.getId()));
                table.addCell(a.getStudent() != null ? a.getStudent().getName() : "");
                table.addCell(a.getStudent() != null ? a.getStudent().getRegisterNumber() : "");
                table.addCell(a.getRoom() != null && a.getRoom().getHostel() != null ? a.getRoom().getHostel().getName() : "");
                table.addCell(a.getRoom() != null && a.getRoom().getRoomType() != null ? a.getRoom().getRoomType().getName() : "");
                table.addCell(a.getRoom() != null ? a.getRoom().getRoomNumber() : "");
                table.addCell(a.getRoom() != null ? String.valueOf(a.getRoom().getFloorNumber()) : "");
                table.addCell(String.valueOf(a.getBedNumber()));
                table.addCell(a.getStatus() != null ? a.getStatus().name() : "");
            }

            document.add(table);
            document.close();
            
            return new ByteArrayInputStream(out.toByteArray());
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to export data to PDF file: " + e.getMessage());
        }
    }

    public ByteArrayInputStream exportStudentsToCsv() {
        List<StudentProfile> students = studentProfileRepository.findAll();

        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             CSVPrinter csvPrinter = new CSVPrinter(new PrintWriter(out), CSVFormat.DEFAULT.withHeader(
                     "ID", "Name", "Register Number", "Email", "Department", "Year", "Gender", "Phone", "Allocation Status"
             ))) {

            for (StudentProfile s : students) {
                csvPrinter.printRecord(
                        s.getId(),
                        s.getName(),
                        s.getRegisterNumber(),
                        s.getUser() != null ? s.getUser().getEmail() : "",
                        s.getDepartment(),
                        s.getYear(),
                        s.getGender() != null ? s.getGender().name() : "",
                        s.getPhone(),
                        s.getAllocationStatus() != null ? s.getAllocationStatus().name() : ""
                );
            }

            csvPrinter.flush();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new RuntimeException("Failed to export students to CSV file: " + e.getMessage());
        }
    }
}