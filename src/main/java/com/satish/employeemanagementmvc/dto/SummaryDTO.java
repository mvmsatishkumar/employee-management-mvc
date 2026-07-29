package com.satish.employeemanagementmvc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SummaryDTO {

    private String name;

    private Long employeeCount;

    private Double averageSalary;

    private Double totalPayroll;

}