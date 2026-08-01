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
    private final com.satish.employeemanagementmvc.repository.implementation.SummaryRepository summaryRepository;

    private static final int DEFAULT_PAGE = 0;
    private static final int DEFAULT_SIZE = 10;

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return employeeRepository.existsByEmail(email);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email, Long currentId) {
        return employeeRepository.existsByEmailAndIdNot(email, currentId);
    }

    @Override
    @Transactional(readOnly = true)
    public com.satish.employeemanagementmvc.dto.DashboardDTO getDashboardData() {
        List<com.satish.employeemanagementmvc.dto.SummaryDTO> deptSummary =
                summaryRepository.findSummary(com.satish.employeemanagementmvc.enums.SummaryField.DEPARTMENT);
        List<com.satish.employeemanagementmvc.dto.SummaryDTO> desigSummary =
                summaryRepository.findSummary(com.satish.employeemanagementmvc.enums.SummaryField.DESIGNATION);

        EmployeeSearchRequestDTO countRequest = new EmployeeSearchRequestDTO();
        long totalEmployees = employeeRepository.countSearchEmployees(countRequest);

        long totalDeptCount = deptSummary != null ? deptSummary.size() : 0;
        long totalDesigCount = desigSummary != null ? desigSummary.size() : 0;

        double totalPayroll = 0;
        long totalDeptEmployees = 0;
        if (deptSummary != null) {
            for (com.satish.employeemanagementmvc.dto.SummaryDTO dto : deptSummary) {
                totalPayroll += dto.getTotalPayroll() != null ? dto.getTotalPayroll() : 0;
                totalDeptEmployees += dto.getEmployeeCount() != null ? dto.getEmployeeCount() : 0;
            }
        }
        double avgSalary = totalDeptEmployees > 0 ? Math.round(totalPayroll / totalDeptEmployees) : 0;

        EmployeeSearchRequestDTO recentRequest = new EmployeeSearchRequestDTO();
        recentRequest.setSortField(SortField.JOINING_DATE);
        recentRequest.setSortDirection(SortDirection.DESC);
        List<Employee> recentEntities = employeeRepository.searchEmployees(recentRequest, 0, 5);
        List<EmployeeResponseDTO> recentDTOs = recentEntities.stream()
                .map(EmployeeMapper::mapToResponse)
                .toList();

        return new com.satish.employeemanagementmvc.dto.DashboardDTO(
                totalEmployees,
                totalDeptCount,
                totalDesigCount,
                avgSalary,
                recentDTOs
        );
    }

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
        String email = normalizeEmail(employeeRequestDTO.getEmail());
        if (email != null) {
            Employee existing = employeeRepository.findByEmail(email);
            if (existing != null) {
                throw new com.satish.employeemanagementmvc.exception.DuplicateEmailException(email);
            }
        }

        Employee employee = EmployeeMapper.mapToEntity(employeeRequestDTO);
        employeeRepository.save(employee);
        return EmployeeMapper.mapToResponse(employee);
    }

    @Override
    @Transactional
    public EmployeeResponseDTO updateEmployee(Long id, EmployeeRequestDTO employeeRequestDTO) {
        Employee employee = findEmployeeOrThrow(id);

        String newEmail = normalizeEmail(employeeRequestDTO.getEmail());
        if (newEmail != null) {
            Employee existingWithEmail = employeeRepository.findByEmail(newEmail);
            if (existingWithEmail != null && existingWithEmail.getId() != null && !existingWithEmail.getId().equals(id)) {
                throw new com.satish.employeemanagementmvc.exception.DuplicateEmailException(newEmail);
            }
        }

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

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }

        String normalized = email.trim();
        return normalized.isEmpty() ? null : normalized.toLowerCase(Locale.ROOT);
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
