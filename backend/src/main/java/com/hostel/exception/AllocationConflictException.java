package com.hostel.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class AllocationConflictException extends RuntimeException {
    public AllocationConflictException(String message) {
        super(message);
    }
}
