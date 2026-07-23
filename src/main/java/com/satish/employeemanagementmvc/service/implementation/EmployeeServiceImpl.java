package com.satish.employeemanagementmvc.service.implementation;

import com.satish.employeemanagementmvc.dto.EmployeePageResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeRequestDTO;
import com.satish.employeemanagementmvc.dto.EmployeeResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;
import com.satish.employeemanagementmvc.entity.Employee;
import com.satish.employeemanagementmvc.exception.EmployeeNotFoundException;
import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import com.satish.employeemanagementmvc.service.EmployeeService;
import com.satish.employeemanagementmvc.mapper.EmployeeMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;


    @Override
    @Transactional (readOnly = true)
    public EmployeePageResponseDTO searchEmployees(EmployeeSearchRequestDTO request) {

        if (request.getPage() == null) {
            request.setPage(0);
        }
        if (request.getSize() == null) {
            request.setSize(10);
        }

        int page = request.getPage();
        int size = request.getSize();
        int offset = page * size;


        String department = normalize(request.getDepartment());
        String designation = normalize(request.getDesignation());

        request.setDepartment(department);
        request.setDesignation(designation);

        long count = employeeRepository.countSearchEmployees(request);
        int totalPages = (int) Math.ceil(count / (double) size);

        List<Employee> employees;
        if (page >= totalPages)
            employees = Collections.emptyList();
        else
            employees = employeeRepository.searchEmployees(request, offset, size);


        List<EmployeeResponseDTO> content =
                employees.stream()
                        .map(EmployeeMapper::mapToResponse)
                        .toList();

        return new EmployeePageResponseDTO(
               page, size, totalPages, count, page == 0,
                totalPages == 0 || page == totalPages - 1,
                content);

    }

    @Override
    @Transactional (readOnly = true)
    public EmployeeResponseDTO getEmployee(Long id) {

        Employee employee = findEmployeeOrThrow(id);
        return EmployeeMapper.mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponseDTO addEmployee(EmployeeRequestDTO employeeRequestDTO) {

        Employee employee = EmployeeMapper.mapToEntity(employeeRequestDTO);
        employeeRepository.save(employee);
        return EmployeeMapper.mapToResponse(employee);

    }

    @Override
    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO employeeRequestDTO) {

        Employee employee = findEmployeeOrThrow(id);
        EmployeeMapper.updateEntity(employee, employeeRequestDTO);
        employeeRepository.update(employee);
        return EmployeeMapper.mapToResponse(employee);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {

        Employee employee = findEmployeeOrThrow(id);
        employeeRepository.delete(employee);
    }

    private Employee findEmployeeOrThrow(Long id) {

        Employee employee = employeeRepository.findById(id);
        if (employee == null) {
            throw new EmployeeNotFoundException(id);
        }

        return employee;
    }

    private String normalize(String string) {

        if (string == null) return null;

        string = string.trim();
        return string.isEmpty() ? null : string.toLowerCase(Locale.ROOT);
    }
}
