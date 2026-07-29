package com.satish.employeemanagementmvc.controller;

import com.satish.employeemanagementmvc.dto.SummaryDTO;
import com.satish.employeemanagementmvc.enums.SummaryField;
import com.satish.employeemanagementmvc.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/summary")
public class SummaryController {

    private final SummaryService summaryService;

    @GetMapping("/{field}")
    public ResponseEntity<List<SummaryDTO>> getSummary(
            @PathVariable(name = "field") SummaryField field) {

        return ResponseEntity.ok(summaryService.getSummary(field));
    }
}
