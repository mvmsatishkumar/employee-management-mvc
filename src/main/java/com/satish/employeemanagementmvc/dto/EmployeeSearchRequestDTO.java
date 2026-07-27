package com.satish.employeemanagementmvc.dto;

import com.satish.employeemanagementmvc.enums.SortDirection;
import com.satish.employeemanagementmvc.enums.SortField;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@NoArgsConstructor
@Getter
@Setter

public class EmployeeSearchRequestDTO {

    private String department;

    private String designation;

    @PositiveOrZero
    private Double minSalary;

    @PositiveOrZero
    private Double maxSalary;

    @PastOrPresent
    private LocalDate joiningFrom;

    @PastOrPresent
    private LocalDate joiningTo;

    @PositiveOrZero
    private Integer page;

    @Positive
    private Integer size;

    private SortField sortField;

    private SortDirection sortDirection;

}
