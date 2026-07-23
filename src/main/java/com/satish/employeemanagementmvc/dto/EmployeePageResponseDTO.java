package com.satish.employeemanagementmvc.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePageResponseDTO {

    private int currentPage;

    private int pageSize;

    private int totalPages;

    private long totalElements;

    private boolean first;

    private boolean last;

    private List<EmployeeResponseDTO> content;
}
