package com.satish.employeemanagementmvc.exception;

import com.satish.employeemanagementmvc.dto.ErrorResponse;
import com.satish.employeemanagementmvc.dto.ValidationErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(EmployeeNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEmployeeNotFound(
            EmployeeNotFoundException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.NOT_FOUND;
        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        LocalDateTime.now().toString(),
                        status.value(),
                        status.getReasonPhrase(),
                        e.getMessage(),
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInputs(
            MethodArgumentNotValidException e,
            HttpServletRequest request) {

        BindingResult bindingResult = e.getBindingResult();
        List<FieldError> fieldErrors = bindingResult.getFieldErrors();

        Map<String, String> errorMap = fieldErrors.stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        error -> Objects.requireNonNull(error.getDefaultMessage())
                ));

        HttpStatus status = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        LocalDateTime.now().toString(),
                        status.value(),
                        status.getReasonPhrase(),
                        "Validation failed",
                        request.getRequestURI(),
                        errorMap
                ));

    }

    @ExceptionHandler(InvalidSearchCriteriaException.class)
    public ResponseEntity<ValidationErrorResponse> invalidCriteria(
            InvalidSearchCriteriaException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
                .body(new ValidationErrorResponse(
                        LocalDateTime.now().toString(),
                        status.value(),
                        request.getRequestURI(),
                        status.getReasonPhrase(),
                        e.getErrors()
                ));

    }
}
