package com.satish.employeemanagementmvc.service.implementation;

import com.satish.employeemanagementmvc.dto.EmployeeRequestDTO;
import com.satish.employeemanagementmvc.dto.EmployeeResponseDTO;
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
    public List<EmployeeResponseDTO> findAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();

        return employees.stream()
                .map(this::mapToResponse)
                .toList();

    }

    @Override
    @Transactional (readOnly = true)
    public EmployeeResponseDTO getEmployee(Long id) {

        Employee employee = findEmployeeOrThrow(id);
        return mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponseDTO addEmployee(EmployeeRequestDTO employeeRequestDTO) {

        Employee employee = mapToEntity(employeeRequestDTO);
        employeeRepository.save(employee);
        return mapToResponse(employee);

    }

    @Override
    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO employeeRequestDTO) {

        Employee employee = findEmployeeOrThrow(id);
        updateEntity(employee, employeeRequestDTO);
        employeeRepository.update(employee);
        return mapToResponse(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {

        Employee employee = findEmployeeOrThrow(id);
        employeeRepository.delete(employee);
    }


    private Employee mapToEntity(EmployeeRequestDTO employeeRequestDTO) {

        Employee employee = new Employee();
        employee.setName(employeeRequestDTO.getName());
        employee.setDepartment(employeeRequestDTO.getDepartment());
        employee.setDesignation(employeeRequestDTO.getDesignation());
        employee.setEmail(employeeRequestDTO.getEmail());
        employee.setSalary(employeeRequestDTO.getSalary());
        employee.setJoiningDate(employeeRequestDTO.getJoiningDate());
        return employee;
    }

    private void updateEntity(Employee employee, EmployeeRequestDTO employeeRequestDTO) {

        employee.setName(employeeRequestDTO.getName());
        employee.setDepartment(employeeRequestDTO.getDepartment());
        employee.setDesignation(employeeRequestDTO.getDesignation());
        employee.setEmail(employeeRequestDTO.getEmail());
        employee.setSalary(employeeRequestDTO.getSalary());
        employee.setJoiningDate(employeeRequestDTO.getJoiningDate());
    }

    private EmployeeResponseDTO mapToResponse(Employee employee) {

        return new EmployeeResponseDTO(employee.getId(),
                employee.getName(),
                employee.getEmail(),
                employee.getDepartment(),
                employee.getDesignation(),
                employee.getSalary(),
                employee.getJoiningDate());

    }

    private Employee findEmployeeOrThrow(Long id) {

        Employee employee = employeeRepository.findById(id);
        if (employee == null) {
            throw new EmployeeNotFoundException(id);
        }

        return employee;
    }
}
