package com.satish.employeemanagementmvc.service.implementation;

import com.satish.employeemanagementmvc.dto.EmployeePageResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeRequestDTO;
import com.satish.employeemanagementmvc.dto.EmployeeResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;
import com.satish.employeemanagementmvc.entity.Employee;
import com.satish.employeemanagementmvc.enums.SortDirection;
import com.satish.employeemanagementmvc.enums.SortField;
import com.satish.employeemanagementmvc.exception.EmployeeNotFoundException;
import com.satish.employeemanagementmvc.exception.InvalidSearchCriteriaException;
import com.satish.employeemanagementmvc.mapper.EmployeeMapper;
import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import com.satish.employeemanagementmvc.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;

    @Override
    @Transactional(readOnly = true)
    public EmployeePageResponseDTO searchEmployees(EmployeeSearchRequestDTO request) {

        // Default pagination
        if (request.getPage() == null) {
            request.setPage(DEFAULT_PAGE);
        }
        if (request.getSize() == null) {
            request.setSize(DEFAULT_SIZE);
        }

        int page = request.getPage();
        int size = request.getSize();
        int offset = page * size;


        // Normalize input
        request.setDepartment(normalize(request.getDepartment()));
        request.setDesignation(normalize(request.getDesignation()));


        // Business validation
        validateSearchRequest(request);

        //Default sorting
        if (request.getSortField() == null) {
            request.setSortField(SortField.ID);
        }
        if (request.getSortDirection() == null) {
            request.setSortDirection(SortDirection.ASC);
        }


        // Repository
        long count = employeeRepository.countSearchEmployees(request);
        int totalPages = (int) Math.ceil(count / (double) size);

        List<Employee> employees =
                page >= totalPages
                        ? Collections.emptyList()
                        : employeeRepository.searchEmployees(request, offset, size);


        // Entity -> DTO
        List<EmployeeResponseDTO> content = employees.stream()
                .map(EmployeeMapper::mapToResponse)
                .toList();


        // Response
        return new EmployeePageResponseDTO(
                page,
                size,
                totalPages,
                count,
                page == 0,
                totalPages == 0 || page == totalPages - 1,
                content
        );
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

        if (string == null) {
            return null;
        }

        string = string.trim();
        return string.isEmpty() ? null : string.toLowerCase(Locale.ROOT);
    }

    private void validateSearchRequest(EmployeeSearchRequestDTO request) {

        List<String> validationErrors = new ArrayList<>();

        if (request.getMinSalary() != null &&
                request.getMaxSalary() != null &&
                request.getMinSalary() > request.getMaxSalary()) {

            validationErrors.add("Minimum salary cannot be greater than maximum salary.");
        }

        if (request.getJoiningFrom() != null &&
                request.getJoiningTo() != null &&
                request.getJoiningFrom().isAfter(request.getJoiningTo())) {

            validationErrors.add("Joining from date cannot be after joining to date.");
        }


        if (!validationErrors.isEmpty()) {
            throw new InvalidSearchCriteriaException(validationErrors);
        }
    }
}
