package com.satish.employeemanagementmvc.repository;

import org.springframework.stereotype.Repository;

@Repository
public class EmployeeRepository {

    public String getEmployees() {
        return "Employees from repository...";
    }
}
