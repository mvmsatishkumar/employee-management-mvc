import { renderPagination } from "../components/pagination.js";
import { formatCurrency } from "./formatCurrency.js";

export function createSummaryModal() {
  let backdrop = document.getElementById("summaryModalBackdrop");
  let modal = document.getElementById("summaryModal");

  if (!backdrop) {
    backdrop = document.createElement("div");
    backdrop.id = "summaryModalBackdrop";
    backdrop.className = "modal-backdrop";
    document.body.appendChild(backdrop);
  }

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "summaryModal";
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "summaryModalTitle");

    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 id="summaryModalTitle"></h3>
            <p id="summaryModalSubtitle" class="muted-text"></p>
          </div>
          <button id="summaryModalClose" class="secondary-button" type="button">Close</button>
        </div>
        <div class="modal-body">
          <div class="table-wrapper">
            <table class="employee-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody id="summaryModalBody"></tbody>
            </table>
          </div>
          <div class="modal-footer" style="margin-top:16px;display:flex;justify-content:space-between;align-items:center;">
            <div id="summaryModalInfo" class="summary-modal-info muted-text"></div>
            <div id="summaryModalPageStatus" class="summary-modal-page-status muted-text"></div>
          </div>
          <nav id="summaryModalPagination" class="pagination"></nav>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const close = modal.querySelector("#summaryModalClose");

  function closeModal() {
    modal.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
    document.removeEventListener("keydown", handleKeydown);
  }

  function handleKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
  }

  close.onclick = closeModal;
  backdrop.onclick = closeModal;
  document.addEventListener("keydown", handleKeydown);

  return {
    modal,
    backdrop,
    closeModal,
    elements: {
      title: modal.querySelector("#summaryModalTitle"),
      subtitle: modal.querySelector("#summaryModalSubtitle"),
      info: modal.querySelector("#summaryModalInfo"),
      pageStatus: modal.querySelector("#summaryModalPageStatus"),
      body: modal.querySelector("#summaryModalBody"),
      pagination: modal.querySelector("#summaryModalPagination"),
    },
  };
}

export function renderSummaryModalEmployees({
  employees,
  page,
  totalPages,
  title,
  subtitle,
}) {
  const rows = employees.length
    ? employees
        .map(
          (emp) => `
            <tr>
              <td>${escapeHtml(emp.name)}</td>
              <td>${escapeHtml(emp.department)}</td>
              <td>${escapeHtml(emp.designation)}</td>
              <td>${formatCurrency(emp.salary)}</td>
            </tr>
          `,
        )
        .join("")
    : `
        <tr class="empty-row">
          <td colspan="4">No employees found.</td>
        </tr>
      `;

  const pageStatus = totalPages > 0 ? `Page ${page + 1} of ${totalPages}` : "";

  return {
    rows,
    pagination: renderPagination({
      currentPage: page,
      totalPages,
      first: page === 0,
      last: page === totalPages - 1,
    }),
    pageStatus,
    title,
    subtitle,
  };
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value ?? "—";
  return element.innerHTML;
}
