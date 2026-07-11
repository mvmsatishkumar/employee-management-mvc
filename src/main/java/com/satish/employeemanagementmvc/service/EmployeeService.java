package com.satish.employeemanagementmvc.service;

import com.satish.employeemanagementmvc.entity.Employee;
import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Transactional (readOnly = true)
    public List<Employee> findAllEmployees() {
        return employeeRepository.findAll();
    }

    @Transactional (readOnly = true)
    public Employee getEmployee(Long id) {
        return employeeRepository.findById(id);
    }

    @Transactional
    public void addEmployee(Employee employee) {
        employeeRepository.save(employee);
    }

    @Transactional
    public void updateEmployee(Employee employee) {
        employeeRepository.update(employee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        employeeRepository.delete(id);
    }
}
