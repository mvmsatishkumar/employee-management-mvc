package com.satish.employeemanagementmvc.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SummaryField {

    DEPARTMENT("department"),
    DESIGNATION("designation");

    private final String property;

    public static SummaryField fromProperty(String property) {

        for (SummaryField field : values()) {
            if (field.property.equalsIgnoreCase(property)) {
                return field;
            }
        }

        throw new IllegalArgumentException("Invalid summary field: " + property);
    }
}