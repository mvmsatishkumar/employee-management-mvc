package com.satish.employeemanagementmvc.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    private String timeStamp;
    private int status;
    private String reason;
    private String message;
    private String path;
    private Map<String, String> validationErrors;

    public ErrorResponse(
            String timeStamp,
            int status,
            String error,
            String message,
            String path) {

        this.timeStamp = timeStamp;
        this.status = status;
        this.reason = error;
        this.message = message;
        this.path = path;
    }

}
