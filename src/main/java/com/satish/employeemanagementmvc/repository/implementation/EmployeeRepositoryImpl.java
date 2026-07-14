package com.satish.employeemanagementmvc.repository.implementation;

import com.satish.employeemanagementmvc.entity.Employee;

import com.satish.employeemanagementmvc.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.springframework.stereotype.Repository;

import java.util.List;

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
    public List<Employee> findAll() {
        return currentSession().createQuery("from Employee", Employee.class)
                .getResultList();
    }

    @Override
    public void update(Employee employee) {
        currentSession().merge(employee);
    }

    @Override
    public void delete(Long id) {
        Employee employee = currentSession().find(Employee.class, id);
        if(employee != null){
            currentSession().remove(employee);
        }
    }

}
