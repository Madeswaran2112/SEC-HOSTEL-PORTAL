package com.hostel.controller;

import com.hostel.dto.request.RoomRequest;
import com.hostel.dto.response.ApiResponse;
import com.hostel.dto.response.PagedResponse;
import com.hostel.dto.response.RoomResponse;
import com.hostel.enums.RoomStatus;
import com.hostel.service.RoomService;
import com.hostel.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.hostel.dto.response.ExcelImportResponse;
import com.hostel.dto.response.ExcelPreviewResponse;
import com.hostel.service.RoomExcelService;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final RoomExcelService roomExcelService;

    @GetMapping("/excel/template")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<byte[]> downloadTemplate() {
        byte[] excelBytes = roomExcelService.generateTemplateExcel();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SEC_Hostel_Room_Template.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    @PostMapping(value = "/excel/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ExcelPreviewResponse>> previewExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("hostelId") Long hostelId) {
        ExcelPreviewResponse response = roomExcelService.previewRoomExcel(file, hostelId);
        return ResponseEntity.ok(ApiResponse.success("Excel parsed successfully", response));
    }

    @PostMapping(value = "/excel/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<ExcelImportResponse>> importExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("hostelId") Long hostelId) {
        ExcelImportResponse response = roomExcelService.importRoomExcel(file, hostelId);
        return ResponseEntity.ok(ApiResponse.success("Excel imported successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> createRoom(@Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.createRoom(request);
        return new ResponseEntity<>(ApiResponse.success("Room created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<RoomResponse>>> getAllRooms(
            @RequestParam(required = false) Long hostelId,
            @RequestParam(required = false) RoomStatus status,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        PagedResponse<RoomResponse> response = roomService.getAllRooms(hostelId, status, page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Rooms retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        RoomResponse response = roomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Room retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        RoomResponse response = roomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", response));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> updateRoomStatus(@PathVariable Long id, @RequestParam RoomStatus status) {
        RoomResponse response = roomService.updateRoomStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Room status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Room deleted successfully", null));
    }
}
