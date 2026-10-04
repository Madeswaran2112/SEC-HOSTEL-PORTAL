package com.hostel.dto.request;

import com.hostel.enums.HostelType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HostelRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Hostel type is required")
    private HostelType hostelType;

    private String address;

    @NotNull(message = "Total floors is required")
    @Min(value = 1, message = "Total floors must be at least 1")
    private Integer totalFloors;
}
