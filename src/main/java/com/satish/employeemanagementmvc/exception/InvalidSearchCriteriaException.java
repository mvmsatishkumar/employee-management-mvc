package com.satish.employeemanagementmvc.exception;


import lombok.Getter;

import java.util.List;

@Getter
public class InvalidSearchCriteriaException extends RuntimeException{

    private final List<String> errors;

    public InvalidSearchCriteriaException(List<String> errors) {

        super("Invalid search criteria.");
        this.errors = List.copyOf(errors); // own immutable copy.
    }
}
