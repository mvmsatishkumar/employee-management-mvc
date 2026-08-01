import { apiRequest } from "./apiClient.js";

export function getEmployees(criteria = {}) {
  const params = new URLSearchParams();

  Object.entries(criteria).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params.set(key, value);
    }
  });

  const query = params.toString();
  return apiRequest(`/employees${query ? `?${query}` : ""}`);
}

export function getEmployee(id) {
  return apiRequest(`/employees/${id}`);
}

export function createEmployee(employee) {
  console.count("POST Employee API");
  return apiRequest("/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
}

export function updateEmployee(id, employee) {
  return apiRequest(`/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });
}

export function deleteEmployee(id) {
  return apiRequest(`/employees/${id}`, { method: "DELETE" });
}

export function getDashboard() {
  return apiRequest("/dashboard");
}

export function checkEmailExists(email, currentId = null) {
  const params = new URLSearchParams({ email });
  if (currentId) {
    params.set("currentId", currentId);
  }
  return apiRequest(`/employees/email-exists?${params.toString()}`);
}
