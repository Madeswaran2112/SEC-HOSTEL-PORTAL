package com.hostel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResponse {
    private Long hostelId;
    private String hostelName;
    private int importedCount;
    private int updatedCount;
    private int errorCount;
    private String message;
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}
