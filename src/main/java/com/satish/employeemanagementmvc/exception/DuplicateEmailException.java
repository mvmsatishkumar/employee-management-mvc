package com.satish.employeemanagementmvc.exception;

public class DuplicateEmailException extends RuntimeException {
    private final String email;

    public DuplicateEmailException(String email) {
        super("An employee with email '" + email + "' already exists. Please use a different email address.");
        this.email = email;
    }

    public String getEmail() {
        return email;
    }
}
