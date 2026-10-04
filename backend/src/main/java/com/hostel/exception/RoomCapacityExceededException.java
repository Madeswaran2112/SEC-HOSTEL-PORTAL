package com.hostel.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class RoomCapacityExceededException extends RuntimeException {
    public RoomCapacityExceededException(String message) {
        super(message);
    }
}
