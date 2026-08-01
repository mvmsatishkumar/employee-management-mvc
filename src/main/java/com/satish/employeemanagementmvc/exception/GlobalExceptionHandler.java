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
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
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

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmail(
            DuplicateEmailException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.CONFLICT;
        Map<String, String> errorMap = Map.of("email", "An employee with this email already exists. Please use a different email.");

        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        LocalDateTime.now().toString(),
                        status.value(),
                        status.getReasonPhrase(),
                        "An employee with this email already exists. Please use a different email.",
                        request.getRequestURI(),
                        errorMap
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
                        error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing,
                        LinkedHashMap::new
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

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(
            MissingServletRequestParameterException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        LocalDateTime.now().toString(),
                        status.value(),
                        status.getReasonPhrase(),
                        "Required request parameter '" + e.getParameterName() + "' is missing.",
                        request.getRequestURI()
                ));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException e,
            HttpServletRequest request) {

        HttpStatus status = HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status)
                .body(new ErrorResponse(
                        LocalDateTime.now().toString(),
                        status.value(),
                        status.getReasonPhrase(),
                        "The parameter '" + e.getName() + "' must be a valid value.",
                        request.getRequestURI()
                ));
    }
}
