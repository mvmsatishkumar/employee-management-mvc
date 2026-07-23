package com.satish.employeemanagementmvc.repository.implementation;

import com.satish.employeemanagementmvc.dto.EmployeeSearchRequestDTO;
import com.satish.employeemanagementmvc.entity.Employee;
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
    public void save(Employee employee) {
        currentSession().persist(employee);
    }

    @Override
    public Employee findById(Long id) {
        return currentSession().find(Employee.class, id);
    }

    @Override
    public List<Employee> searchEmployees(EmployeeSearchRequestDTO request, int offset, int limit) {

        StringBuilder hql = new StringBuilder("from Employee e WHERE 1 = 1");
        Map<String, Object> parameters = new HashMap<>();

        appendFilters(request, parameters, hql);
        Query<Employee> query = currentSession().createQuery(
                hql.toString(), Employee.class);

        bindParameters(query, parameters);

        return query.setFirstResult(offset)
                .setMaxResults(limit)
                .getResultList();
    }

    @Override
    public long countSearchEmployees(EmployeeSearchRequestDTO request) {

        StringBuilder hql = new StringBuilder("select COUNT(e) from Employee e WHERE 1 = 1");
        Map<String, Object> parameters = new HashMap<>();

        appendFilters(request, parameters, hql);


        Query<Long> query = currentSession().createQuery(
                hql.toString(), Long.class);

        bindParameters(query, parameters);

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
            Map<String,Object> parameters) {

        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            query.setParameter(entry.getKey(), entry.getValue());
        }
    }

}
