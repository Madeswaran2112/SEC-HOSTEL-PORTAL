package com.hostel.util;

import com.hostel.dto.response.PagedResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public class PaginationUtil {

    public static <T, U> PagedResponse<U> createPagedResponse(Page<T> page, List<U> content) {
        return PagedResponse.<U>builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
