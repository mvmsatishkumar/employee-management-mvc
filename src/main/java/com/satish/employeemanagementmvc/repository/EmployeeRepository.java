package com.satish.employeemanagementmvc.repository;

import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;
import com.satish.employeemanagementmvc.entity.Employee;

import java.util.List;

public interface EmployeeRepository {

    void save(Employee employee);

    Employee findById(Long id);

    Employee findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long currentId);

    List<Employee> searchEmployees(EmployeeSearchRequestDTO request, int offset, int limit);

    void update(Employee employee);

    void delete(Employee employee);

    long countSearchEmployees(EmployeeSearchRequestDTO request);

}
