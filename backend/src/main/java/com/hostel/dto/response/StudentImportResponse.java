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
public class StudentImportResponse {
    private int totalRows;
    private int importedCount;
    private int errorCount;
    private String message;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
