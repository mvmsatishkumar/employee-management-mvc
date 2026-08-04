# Employee Dataset

This dataset is used by the **Employee Management Platform** to
demonstrate searching, filtering, sorting, pagination, dashboard
analytics, and summary APIs.

## Dataset

-   **File:** `employees.sql`
-   **Database:** PostgreSQL
-   **Purpose:** Seed data for the Employee Management Platform
-   **Approximate Size:** \~2 MB

## Features Demonstrated

-   Employee CRUD operations
-   Dashboard statistics
-   Department-wise search
-   Designation-wise search
-   Salary range filtering
-   Joining date range filtering
-   Combined search
-   Server-side pagination
-   Sorting by multiple fields

## Import Instructions

1.  Create a PostgreSQL database.
2.  Execute:

``` sql
psql -U postgres -d employee_management -f employees.sql
```

Alternatively, import the SQL file using pgAdmin.

## Notes

-   Intended for development, testing, and demonstration.
-   Employee records are synthetic.
-   No production or sensitive information is included.
