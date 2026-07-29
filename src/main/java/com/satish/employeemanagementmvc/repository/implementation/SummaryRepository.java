package com.satish.employeemanagementmvc.repository.implementation;

import com.satish.employeemanagementmvc.dto.SummaryDTO;
import com.satish.employeemanagementmvc.enums.SummaryField;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class SummaryRepository {

    private final SessionFactory sessionFactory;

    public List<SummaryDTO> findSummary(SummaryField field) {

        Session session = sessionFactory.getCurrentSession();

        String property = field.getProperty();

        final String DTO =
                SummaryDTO.class.getName();

        String hql = String.format("""
                SELECT new %s(
                    e.%s,
                    COUNT(e.id),
                    AVG(e.salary),
                    SUM(e.salary)
                )
                FROM Employee e
                GROUP BY e.%s
                ORDER BY COUNT(e.id) DESC
                """, DTO, property, property);

        return session
                .createQuery(hql, SummaryDTO.class)
                .getResultList();
    }
}