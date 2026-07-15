package com.satish.employeemanagementmvc.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDate;

@Data
@AllArgsConstructor
public class EmployeeResponseDTO {

    private Long id;
    private String name;
    private String email;
    private String department;
    private String designation;
    private Double salary;
    @JsonFormat (pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;

}
