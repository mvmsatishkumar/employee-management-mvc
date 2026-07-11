package com.satish.employeemanagementmvc.repository;

import com.satish.employeemanagementmvc.entity.Employee;

import java.util.List;

public interface EmployeeRepository {

    void save(Employee employee);

    Employee findById(Long id);

    List<Employee> findAll();

    void update(Employee employee);

    void delete(Long id);
}
