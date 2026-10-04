package com.hostel.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GroupCreateRequest {
    @NotBlank(message = "Group name is required")
    private String groupName;

    @NotNull(message = "Preferred Room Type ID is required")
    private Long preferredRoomTypeId;

    @NotNull(message = "Max size is required")
    @Min(value = 2, message = "Group must have at least 2 members")
    @Max(value = 10, message = "Group cannot exceed 10 members")
    private Integer maxSize;

    private java.util.List<String> memberRegisterNumbers;
}
