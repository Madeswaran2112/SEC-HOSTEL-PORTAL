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
public class ExcelPreviewResponse {
    private Long hostelId;
    private String hostelName;
    private int totalRows;
    private int validRows;
    private int errorRows;
    @Builder.Default
    private List<ExcelRoomRowDto> rows = new ArrayList<>();
}
