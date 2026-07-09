package com.satish.employeemanagementmvc.service;

import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }


    public String getEmployees() {
        return employeeRepository.getEmployees();
    }
}
