package com.satish.employeemanagementmvc.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SortField {

    ID("id"),
    NAME("name"),
    SALARY("salary"),
    DEPARTMENT("department"),
    DESIGNATION("designation"),
    JOINING_DATE("joiningDate");

    private final String property;

}
