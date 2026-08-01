package com.satish.employeemanagementmvc.repository.implementation;

import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;
import com.satish.employeemanagementmvc.entity.Employee;
import com.satish.employeemanagementmvc.enums.SortField;
import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.query.Query;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class EmployeeRepositoryImpl implements EmployeeRepository {

    private final SessionFactory sessionFactory;

    private Session currentSession() {
        return sessionFactory.getCurrentSession();
    }

    @Override
    public List<Employee> searchEmployees(EmployeeSearchRequestDTO request, int offset, int limit) {

        // Base query
        StringBuilder hql = new StringBuilder("from Employee e WHERE 1 = 1");
        Map<String, Object> parameters = new HashMap<>();


        // Dynamic filters
        appendFilters(request, parameters, hql);


        // Dynamic sorting
        appendOrderBy(request, hql);


        // Query creation
        Query<Employee> query =
                currentSession().createQuery(hql.toString(), Employee.class);


        // Bind query parameters
        bindParameters(query, parameters);


        // Pagination + execution
        return query.setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    public void save(Employee employee) {
        currentSession().persist(employee);
    }


    @Override
    public Employee findById(Long id) {
        return currentSession().find(Employee.class, id);
    }

    @Override
    public Employee findByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return null;
        }
        String hql = "from Employee e where lower(e.email) = :email";
        return currentSession()
                .createQuery(hql, Employee.class)
                .setParameter("email", email.trim().toLowerCase())
                .uniqueResultOptional()
                .orElse(null);
    }

    @Override
    public boolean existsByEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        String hql = "select count(e) from Employee e where lower(e.email) = :email";
        Long count = currentSession()
                .createQuery(hql, Long.class)
                .setParameter("email", email.trim().toLowerCase())
                .getSingleResult();
        return count != null && count > 0;
    }

    @Override
    public boolean existsByEmailAndIdNot(String email, Long currentId) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        if (currentId == null) {
            return existsByEmail(email);
        }
        String hql = "select count(e) from Employee e where lower(e.email) = :email and e.id != :currentId";
        Long count = currentSession()
                .createQuery(hql, Long.class)
                .setParameter("email", email.trim().toLowerCase())
                .setParameter("currentId", currentId)
                .getSingleResult();
        return count != null && count > 0;
    }



    @Override
    public long countSearchEmployees(EmployeeSearchRequestDTO request) {

        // Base query
        StringBuilder hql =
                new StringBuilder("select COUNT(e) from Employee e WHERE 1 = 1");

        Map<String, Object> parameters = new HashMap<>();


        // Dynamic filters
        appendFilters(request, parameters, hql);


        // Query creation
        Query<Long> query =
                currentSession().createQuery(hql.toString(), Long.class);


        // Bind query parameters
        bindParameters(query, parameters);


        // Execute query
        return query.getSingleResult();
    }


    @Override
    public void update(Employee employee) {
        currentSession().merge(employee);
    }


    @Override
    public void delete(Employee employee) {
            currentSession().remove(employee);
    }

    private void appendFilters(
            EmployeeSearchRequestDTO request,
            Map<String, Object> parameters, StringBuilder hql) {

        if (request.getDepartment() != null) {
            hql.append(" AND lower(e.department) = :department");
            parameters.put("department", request.getDepartment());
        }

        if (request.getDesignation() != null) {
            hql.append(" AND lower(e.designation) = :designation");
            parameters.put("designation", request.getDesignation());
        }

        if (request.getMinSalary() != null) {
            hql.append(" AND e.salary >= :minSalary");
            parameters.put("minSalary", request.getMinSalary());
        }

        if (request.getMaxSalary() != null) {
            hql.append(" AND e.salary <= :maxSalary");
            parameters.put("maxSalary", request.getMaxSalary());
        }

        if (request.getJoiningFrom() != null) {
            hql.append(" AND e.joiningDate >= :joiningDateFrom");
            parameters.put("joiningDateFrom", request.getJoiningFrom());
        }

        if (request.getJoiningTo() != null) {
            hql.append(" AND e.joiningDate <= :joiningDateTo");
            parameters.put("joiningDateTo", request.getJoiningTo());
        }
    }


    private void bindParameters(
            Query<?> query,
            Map<String, Object> parameters) {

        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
    }


    private void appendOrderBy(
            EmployeeSearchRequestDTO request,
            StringBuilder hql) {

        hql.append(" ORDER BY e.");
        hql.append(request.getSortField().getProperty());
        hql.append(" ");
        hql.append(request.getSortDirection());

        if (request.getSortField() != SortField.ID) {
            hql.append(", e.id ASC");
        }
    }

}
