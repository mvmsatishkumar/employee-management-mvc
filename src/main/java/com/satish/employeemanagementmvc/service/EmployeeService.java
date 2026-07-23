package com.satish.employeemanagementmvc.service;

import com.satish.employeemanagementmvc.dto.EmployeePageResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeRequestDTO;
import com.satish.employeemanagementmvc.dto.EmployeeResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;

public interface EmployeeService {
    EmployeePageResponseDTO searchEmployees(EmployeeSearchRequestDTO request);

    EmployeeResponseDTO getEmployee(Long id);

    EmployeeResponseDTO addEmployee(EmployeeRequestDTO employeeRequestDTO);

    EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO employeeRequestDTO);

    void deleteEmployee(Long id);

}
