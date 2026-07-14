package com.satish.employeemanagementmvc.service;

import com.satish.employeemanagementmvc.entity.Employee;
import java.util.List;

public interface EmployeeService {
    List<Employee> findAllEmployees();

    Employee getEmployee(Long id);

    Employee addEmployee(Employee employee);

    Employee updateEmployee(Employee employee);

    void deleteEmployee(Long id);

}
