package com.satish.employeemanagementmvc.controller;

import com.satish.employeemanagementmvc.entity.Employee;
import com.satish.employeemanagementmvc.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    public List<Employee> getEmployees() {
        return employeeService.findAllEmployees();
    }

    @GetMapping("/{id}")
    public Employee getEmployee(@PathVariable("id") Long id) {
        return employeeService.getEmployee(id);
    }

    @PostMapping
    public String addEmployee(@RequestBody Employee employee) {
        employeeService.addEmployee(employee);
        return "Employee Added Successfully";
    }

    @PutMapping ("/{id}")
    public String editEmployee(@PathVariable("id") Long id, @RequestBody Employee employee) {
        employee.setId(id);
        employeeService.updateEmployee(employee);
        return "Employee Updated Successfully";
    }

    @DeleteMapping("/{id}")
    public String deleteEmployee(@PathVariable("id") Long id) {
        employeeService.deleteEmployee(id);
        return "Employee Deleted Successfully";
    }

}
