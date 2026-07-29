package com.satish.employeemanagementmvc.config;

import com.satish.employeemanagementmvc.enums.SummaryField;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class SummaryFieldConverter implements Converter<String, SummaryField> {

    @Override
    public SummaryField convert(String source) {
        return SummaryField.fromProperty(source);
    }
}