package com.satish.employeemanagementmvc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ValidationErrorResponse {

    private String timeStamp;
    private int status;
    private String path;
    private String reason;
    private List<String> errors;

}
