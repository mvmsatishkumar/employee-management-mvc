package com.satish.employeemanagementmvc.exception;

import com.satish.employeemanagementmvc.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEmployeeNotFound(EmployeeNotFoundException e,
                                                                HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse();
        errorResponse.setError(HttpStatus.NOT_FOUND.getReasonPhrase());
        errorResponse.setPath(request.getRequestURI());
        errorResponse.setMessage(e.getMessage());
        errorResponse.setStatus(HttpStatus.NOT_FOUND.value());
        errorResponse.setTimeStamp(LocalDateTime.now().toString());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

//        return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                .body(new ErrorResponse(
//                        LocalDateTime.now(),
//                        HttpStatus.NOT_FOUND.value(),
//                        HttpStatus.NOT_FOUND.getReasonPhrase(),
//                        e.getMessage(),
//                        request.getRequestURI()
//                ));
    }
}
