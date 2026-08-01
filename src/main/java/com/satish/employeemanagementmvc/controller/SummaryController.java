package com.satish.employeemanagementmvc.controller;

import com.satish.employeemanagementmvc.dto.SummaryDTO;
import com.satish.employeemanagementmvc.enums.SummaryField;
import com.satish.employeemanagementmvc.service.SummaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
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
