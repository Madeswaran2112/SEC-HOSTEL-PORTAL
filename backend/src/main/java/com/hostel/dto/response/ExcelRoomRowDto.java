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
public class ExcelRoomRowDto {
    private int rowNumber;
    private String hostelName;
    private Integer floorNumber;
    private String roomNumber;
    private String roomTypeName;
    private Boolean isAc;
    private Integer totalCapacity;
    private Integer availableBeds;
    private String status;
    private boolean valid;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
