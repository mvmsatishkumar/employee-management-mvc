import { formatCurrency } from "../utils/formatCurrency.js";

export function renderSearchRows(employees) {
  return employees
    .map(
      (employee) => `
        <tr>
          <td>${escapeHtml(employee.id)}</td>
          <td>${escapeHtml(employee.name)}</td>
          <td>${escapeHtml(employee.department)}</td>
          <td>${escapeHtml(employee.designation)}</td>
          <td>${formatCurrency(employee.salary)}</td>
          <td>${formatDate(employee.joiningDate)}</td>
        </tr>
      `,
    )
    .join("");
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value ?? "—";
  return element.innerHTML;
}
