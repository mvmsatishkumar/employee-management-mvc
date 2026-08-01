package com.satish.employeemanagementmvc.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DashboardDTO {
    private long totalEmployees;
    private long totalDepartments;
    private long totalDesignations;
    private double averageSalary;
    private List<EmployeeResponseDTO> recentEmployees;
}
