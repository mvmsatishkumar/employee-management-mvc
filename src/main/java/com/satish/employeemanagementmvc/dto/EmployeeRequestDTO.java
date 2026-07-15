package com.satish.employeemanagementmvc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EmployeeRequestDTO {

    private String name;
    private String email;
    private String department;
    private String designation;
    private Double salary;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

}
