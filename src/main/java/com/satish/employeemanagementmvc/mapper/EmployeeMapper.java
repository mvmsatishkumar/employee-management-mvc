package com.satish.employeemanagementmvc.mapper;

import com.satish.employeemanagementmvc.dto.EmployeeRequestDTO;
import com.satish.employeemanagementmvc.dto.EmployeeResponseDTO;
import com.satish.employeemanagementmvc.entity.Employee;

public final class EmployeeMapper {

    public static Employee mapToEntity(EmployeeRequestDTO employeeRequestDTO) {

        Employee employee = new Employee();
        employee.setName(employeeRequestDTO.getName());
        employee.setDepartment(employeeRequestDTO.getDepartment());
        employee.setDesignation(employeeRequestDTO.getDesignation());
        employee.setEmail(employeeRequestDTO.getEmail());
        employee.setSalary(employeeRequestDTO.getSalary());
        employee.setJoiningDate(employeeRequestDTO.getJoiningDate());
        return employee;
    }

    public static void updateEntity(Employee employee, EmployeeRequestDTO employeeRequestDTO) {

        employee.setName(employeeRequestDTO.getName());
        employee.setDepartment(employeeRequestDTO.getDepartment());
        employee.setDesignation(employeeRequestDTO.getDesignation());
        employee.setEmail(employeeRequestDTO.getEmail());
        employee.setSalary(employeeRequestDTO.getSalary());
        employee.setJoiningDate(employeeRequestDTO.getJoiningDate());
    }

    public static EmployeeResponseDTO mapToResponse(Employee employee) {

        return new EmployeeResponseDTO(employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getSalary(),
                employee.getJoiningDate());

    }
}
