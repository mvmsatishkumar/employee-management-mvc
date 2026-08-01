package com.satish.employeemanagementmvc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRequestDTO {

    @NotBlank(message = "Employee name is required. Please provide a valid full name.")
    @Pattern(
            regexp = "^[A-Za-z]+(?: [A-Za-z]+)*$",
            message = "Employee name must contain only letters and single spaces between words."
    )
    private String name;

    
    @NotBlank(message = "Email address is required. Please enter a valid work email address.")
    @Pattern(
            regexp = "^[A-Za-z0-9_%+-]+(?:\\.[A-Za-z0-9_%+-]+)*@[A-Za-z0-9-]+(?:\\.[A-Za-z0-9-]+)+$",
            message = "Email address format is invalid. Please enter a valid email address (e.g. user@company.com)"
    )
    private String email;

    @NotBlank(message = "Department selection is required. Please select a valid department from the dropdown.")
    private String department;

    @NotBlank(message = "Designation selection is required. Please select a valid job title from the dropdown.")
    private String designation;

    @PositiveOrZero(message = "Salary amount cannot be negative. Please enter a valid non-negative salary figure.")
    @NotNull(message = "Salary amount is required. Please specify a non-negative annual or monthly salary figure.")
    private Double salary;

    @PastOrPresent(message = "Joining date cannot be in the future. Please select today's date or a past date.")
    @NotNull(message = "Joining date is required. Please select the date when the employee joined the company.")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

}
