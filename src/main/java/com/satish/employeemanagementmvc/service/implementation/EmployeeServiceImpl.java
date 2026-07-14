package com.satish.employeemanagementmvc.service.implementation;

import com.satish.employeemanagementmvc.entity.Employee;
import com.satish.employeemanagementmvc.exception.EmployeeNotFoundException;
import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import com.satish.employeemanagementmvc.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional (readOnly = true)
    public List<Employee> findAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    @Transactional (readOnly = true)
    public Employee getEmployee(Long id) {
        Employee employee = employeeRepository.findById(id);
        if (employee == null) {
            throw new EmployeeNotFoundException(id);
        }
        return employee;
    }

    @Override
    @Transactional
    public Employee addEmployee(Employee employee) {
        employeeRepository.save(employee);
        return employee;
    }

    @Override
    @Transactional
    public Employee updateEmployee(Employee employee) {
        employeeRepository.update(employee);
        return employee;
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        employeeRepository.delete(id);
    }
}
