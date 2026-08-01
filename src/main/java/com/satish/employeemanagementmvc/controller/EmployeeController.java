package com.satish.employeemanagementmvc.controller;

import com.satish.employeemanagementmvc.dto.EmployeePageResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeRequestDTO;
import com.satish.employeemanagementmvc.dto.EmployeeResponseDTO;
import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;
import com.satish.employeemanagementmvc.service.EmployeeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping("/dashboard")
    public ResponseEntity<com.satish.employeemanagementmvc.dto.DashboardDTO> getDashboard() {
        return ResponseEntity.ok(employeeService.getDashboardData());
    }

    @GetMapping
    public ResponseEntity<EmployeePageResponseDTO> getEmployees(
            @Valid EmployeeSearchRequestDTO request
    ) {
        EmployeePageResponseDTO employeeResponses = employeeService.searchEmployees(request);
        return ResponseEntity.ok(employeeResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> getEmployee(@PathVariable("id") Long id) {
        return ResponseEntity.ok(employeeService.getEmployee(id));
    }

    @PostMapping
    public ResponseEntity<EmployeeResponseDTO> addEmployee(@RequestBody @Valid EmployeeRequestDTO employeeRequestDTO) {
        EmployeeResponseDTO employeeResponseDTO = employeeService.addEmployee(employeeRequestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(employeeResponseDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponseDTO> editEmployee(@PathVariable("id") Long id,
                                                            @RequestBody @Valid EmployeeRequestDTO employeeRequestDTO) {

        EmployeeResponseDTO updated = employeeService.updateEmployee(id, employeeRequestDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEmployee(@PathVariable("id") Long id) {

        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

}
