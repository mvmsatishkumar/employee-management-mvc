package com.satish.employeemanagementmvc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRequestDTO {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Not an valid Email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Department is required")
    private String department;

    @NotBlank(message = "Designation is required")
    private String designation;

    @PositiveOrZero(message = "Salary must be either equal or greater than 0")
    @NotNull(message = "Salary is required")
    private Double salary;

    @PastOrPresent(message = "Joining date cannot be in the future")
    @NotNull(message = "Joining date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

}
