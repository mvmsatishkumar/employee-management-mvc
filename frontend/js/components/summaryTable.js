import { formatCurrency } from "../utils/formatCurrency.js";

export function renderSummaryTable(summary, title) {
  return `
    <div class="search-bar search-bar--small" style="margin-bottom:16px;">
      <i data-lucide="search" aria-hidden="true"></i>
      <input
        id="summary-search"
        type="text"
        placeholder="Filter ${title.toLowerCase()}s by name..."
        aria-label="Filter ${title.toLowerCase()}s"
      />
    </div>

    <section class="table-section" aria-label="${title} Summary Table">
      <div class="table-wrapper">
        <table class="employee-table summary-table">
          <thead>
            <tr>
              <th scope="col">${escapeHtml(title)}</th>
              <th scope="col">Employees</th>
              <th scope="col">Average Salary</th>
              <th scope="col">Total Payroll</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            ${summary
              .map(
                (item) => `
                <tr>
                  <td>${escapeHtml(item.name)}</td>
                  <td>${item.employeeCount}</td>
                  <td>${formatCurrency(item.averageSalary)}</td>
                  <td>${formatCurrency(item.totalPayroll)}</td>
                  <td>
                    <button class="view-button" type="button" aria-label="View employees for ${escapeHtml(item.name)}">
                      <i data-lucide="eye" aria-hidden="true"></i>
                    </button>
                  </td>
                </tr>
              `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value ?? "—";
  return element.innerHTML;
}
