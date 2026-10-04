package com.hostel.controller;

import com.hostel.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/allocations/csv")
    public ResponseEntity<Resource> exportAllocationsCsv(@RequestParam(required = false) Long windowId) {
        String filename = windowId != null ? "allocations_" + windowId + ".csv" : "allocations_all.csv";
        InputStreamResource file = new InputStreamResource(exportService.exportAllocationsToCsv(windowId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }

    @GetMapping("/allocations/excel")
    public ResponseEntity<Resource> exportAllocationsExcel(@RequestParam(required = false) Long windowId) {
        String filename = windowId != null ? "allocations_" + windowId + ".xlsx" : "allocations_all.xlsx";
        InputStreamResource file = new InputStreamResource(exportService.exportAllocationsToExcel(windowId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/allocations/pdf")
    public ResponseEntity<Resource> exportAllocationsPdf(@RequestParam(required = false) Long windowId) {
        String filename = windowId != null ? "allocations_" + windowId + ".pdf" : "allocations_all.pdf";
        InputStreamResource file = new InputStreamResource(exportService.exportAllocationsToPdf(windowId));

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }

    @GetMapping("/students/csv")
    public ResponseEntity<Resource> exportStudentsCsv() {
        String filename = "students_directory.csv";
        InputStreamResource file = new InputStreamResource(exportService.exportStudentsToCsv());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(file);
    }
}