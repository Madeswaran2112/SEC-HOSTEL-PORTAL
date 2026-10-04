package com.hostel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponse {
    private Long id;
    private String name;
    private Integer capacity;
    private Boolean isAc;
    private BigDecimal baseFee;
    private Boolean isActive;
}
