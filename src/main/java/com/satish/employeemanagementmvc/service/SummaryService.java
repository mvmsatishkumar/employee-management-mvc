package com.satish.employeemanagementmvc.service;

import com.satish.employeemanagementmvc.dto.SummaryDTO;
import com.satish.employeemanagementmvc.enums.SummaryField;
import com.satish.employeemanagementmvc.repository.implementation.SummaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SummaryService {

    @Autowired
    private SummaryRepository summaryRepository;

    @Transactional(readOnly = true)
    public List<SummaryDTO> getSummary(SummaryField field) {

        return summaryRepository.findSummary(field);
    }
}
