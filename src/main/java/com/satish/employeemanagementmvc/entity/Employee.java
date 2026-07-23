package com.satish.employeemanagementmvc.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employee")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false)
    private String name;

    private String department;

    private Double salary;

    private String email;

    private String designation;

    @Column(name = "joining_date")
    private LocalDate joiningDate;
}
