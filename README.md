<p align="center">
<img src="docs/images/banner.png" width="100%">
</p>

# Employee Management Platform | Spring MVC • Hibernate • PostgreSQL

A professional full-stack employee administration system built with Java 21, Spring MVC, Hibernate ORM, PostgreSQL, and a modular vanilla JavaScript frontend. The application is designed to demonstrate a clean layered architecture, RESTful API design, reusable UI components, and a polished user experience for managing workforce data.

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-red?style=for-the-badge&logo=openjdk" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring%20MVC-6.x-6DB33F?style=for-the-badge&logo=spring" alt="Spring MVC" />
  <img src="https://img.shields.io/badge/Hibernate-ORM-59666C?style=for-the-badge&logo=hibernate" alt="Hibernate" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Maven-Build-C71A36?style=for-the-badge&logo=apachemaven" alt="Maven" />
</p>

---

## Overview

Employee Management Platform is a full-stack web application focused on practical software engineering rather than basic CRUD-only implementation. It brings together a traditional Spring MVC backend with a responsive single-page frontend to support employee lifecycle management, organizational summaries, and analytic views.

The project is structured to reflect real-world application concerns such as:

- layered architecture and separation of concerns
- DTO-driven request and response handling
- centralized exception handling and validation
- reusable frontend utilities for loading, confirmation, pagination, and notifications
- scalable server-side search and filtering

---

## Engineering Highlights

- Traditional Spring MVC architecture
- Layered Controller → Service → Repository design
- Hibernate ORM integration
- DTO-driven API contracts
- Global exception handling
- Bean Validation
- Dynamic server-side search
- Server-side pagination
- Duplicate request prevention
- Modular Vanilla JavaScript SPA

---

## Demo

A complete walkthrough video demonstrating:

- Dashboard
- CRUD
- Search
- Sorting
- Pagination
- Validation
- Loading States
- Department Summary
- Designation Summary
- REST API Testing (Postman)

🎥 Demo Video:

---

## Key Capabilities

### Employee Management

- create, view, update, and delete employee records
- duplicate email validation with update-safe handling
- client-side and server-side validation
- modal-based workflows with confirmations and toast feedback

### Workforce Insights

- dashboard with employee, department, designation, and salary summaries
- recent employee activity and high-level statistics
- department and designation summary views

### Advanced Search and Filtering

- multi-criteria employee search
- department and designation filters
- salary range and joining date range filters
- dynamic sorting and server-side pagination

---

## Architecture

The application follows a conventional layered design:

```text
Browser / Frontend
        │
        ▼
Spring MVC Controllers
        │
        ▼
Service Layer
        │
        ▼
Repository Layer (Hibernate ORM)
        │
        ▼
PostgreSQL Database
```

The frontend is implemented as a modular vanilla JavaScript SPA that communicates with the backend through REST endpoints, keeping the user experience smooth while preserving a maintainable separation between presentation and business logic.

---

## Technology Stack

| Layer       | Technologies                                                |
| ----------- | ----------------------------------------------------------- |
| Backend     | Java 21, Spring MVC 6, Hibernate ORM 6, Jakarta Servlet API |
| Persistence | PostgreSQL, Hibernate, JPA-style entity mapping             |
| API         | RESTful controllers, JSON request/response handling         |
| Validation  | Bean Validation, custom business validation                 |
| Frontend    | HTML5, CSS3, Vanilla JavaScript (ES Modules)                |
| Build Tool  | Apache Maven                                                |
| Deployment  | WAR packaging for Apache Tomcat                             |

---

## Project Structure

```text
employee-management-mvc/
├── docs/
│   └── images/
│       └── banner.png
├── frontend/
│   ├── assets/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── router/
│   └── utils/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/satish/employeemanagementmvc/
│   │   │       ├── config/
│   │   │       ├── controller/
│   │   │       ├── dto/
│   │   │       ├── entity/
│   │   │       ├── enums/
│   │   │       ├── exception/
│   │   │       ├── mapper/
│   │   │       ├── repository/
│   │   │       └── service/
│   │   ├── resources/
│   │   └── webapp/
├── pom.xml
└── README.md
```

---

## Getting Started

### Prerequisites

- JDK 21 or later
- Apache Maven 3.9+
- PostgreSQL database
- Apache Tomcat 10+

### 1. Clone the repository

```bash
git clone <repository-url>
cd employee-management-mvc
```

### 2. Configure the database

Update the database connection settings in:

```text
src/main/resources/database.properties
```

Set the appropriate values for:

- JDBC URL
- username
- password
- Hibernate dialect

### 3. Build the application

```bash
mvn clean package
```

This will generate a WAR file in the target directory.

### 4. Deploy to Tomcat

Deploy the generated WAR to your Tomcat server and start the application.

---

## API Highlights

The backend exposes REST endpoints for core business operations, including:

- GET /employees
- GET /employees/{id}
- POST /employees
- PUT /employees/{id}
- DELETE /employees/{id}
- GET /dashboard
- GET /summary/{field}
- GET /employees/email-exists

These endpoints support the full employee workflow and the summary-driven dashboard experience.

---

## Engineering Notes

This project intentionally uses traditional Spring MVC rather than Spring Boot to demonstrate a deeper understanding of the underlying request lifecycle, servlet configuration, dependency wiring, and layered application architecture. The implementation emphasizes maintainability, modularity, and a professional separation between backend and frontend responsibilities.

---

## Potential Future Enhancements

Planned improvements include:

- authentication and role-based access control
- audit logging and activity tracking
- Docker deployment support
- CI/CD pipeline integration
- unit and integration testing
- OpenAPI documentation

---

## License

This project is intended for educational, portfolio, and demonstration purposes.
