import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  checkEmailExists,
} from "../services/employeeService.js";
import { getSummary } from "../services/summaryService.js";
import {
  renderPagination,
  handleGotoPageClick,
} from "../components/pagination.js";
import { renderTableSkeletons } from "../components/skeletonLoader.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { showConfirm } from "../utils/confirmModal.js";
import { showToast } from "../utils/toast.js";
import { withButtonLoading } from "../utils/loading.js";

const PAGE_SIZE = 10;

let employeeFormMode = "create";
let editingEmployeeId = null;

export async function loadEmployeesPage() {
  const searchInput = document.getElementById("employeeSearch");
  const refreshButton = document.getElementById("refreshEmployeesButton");
  const addButton = document.getElementById("openEmployeeFormButton");
  const modal = document.getElementById("employeeFormModal");
  const backdrop = document.getElementById("employeeFormBackdrop");
  const cancelButton = document.getElementById("employeeCancelButton");
  const form = document.getElementById("employeeForm");
  const closeButton = document.getElementById("employeeCloseButton");
  const tableBody = document.getElementById("employeeTableBody");
  const pagination = document.getElementById("employeePagination");
  const tableSection = document.querySelector(".table-section");
  const status = document.getElementById("employeeStatus");
  const pageInfo = document.getElementById("employeePageInfo");
  const submitButton = document.getElementById("employeeSubmitButton");
  const employeeIdInput = document.getElementById("employeeId");
  const employeeIdGroup = document.getElementById("employeeIdGroup");
  const emailInput =
    form?.querySelector('[name="email"]') ||
    document.getElementById("employeeEmail");
  const modalListenersInitialized =
    window.__employeeFormListenersBound === true ||
    form?.dataset.initialized === "true";

  const state = {
    page: 0,
    totalPages: 1,
    employees: [],
    activeEmployee: null,
    searchId: null,
    isSubmitting: false,
  };

  function resetEmployeeFormState() {
    state.isSubmitting = false;
    state.activeEmployee = null;
    employeeFormMode = "create";
    editingEmployeeId = null;

    if (form) {
      form.reset();
      clearValidationErrors(form);
      Array.from(form.elements).forEach((element) => {
        if (element.type !== "button" && element.type !== "submit") {
          element.disabled = false;
        }
      });
    }

    if (employeeIdInput) employeeIdInput.value = "";
    if (employeeIdGroup) employeeIdGroup.style.display = "none";

    const formTitle = document.getElementById("employeeFormTitle");
    const formSubtitle = document.getElementById("employeeFormSubtitle");
    if (formTitle) formTitle.textContent = "Add Employee";
    if (formSubtitle)
      formSubtitle.textContent = "Enter details for the new employee record.";

    if (submitButton) {
      submitButton.disabled = false;
      submitButton.style.display = "inline-flex";
      submitButton.textContent = "Create Employee";
    }
    if (cancelButton) {
      cancelButton.disabled = false;
      cancelButton.style.display = "inline-flex";
      cancelButton.textContent = "Cancel";
    }

    showStatus("");
  }

  function clearValidationErrors(targetForm) {
    const formEl = targetForm || form;
    if (!formEl) return;
    formEl
      .querySelectorAll(".input--invalid, .invalid, .error-message")
      .forEach((el) =>
        el.classList.remove("input--invalid", "invalid", "error-message"),
      );
    formEl
      .querySelectorAll(".field-error, .error-message, .invalid-feedback")
      .forEach((el) => el.remove());
  }

  function applyValidationErrors(validation, targetForm) {
    const formEl = targetForm || form;
    if (!formEl) return;
    clearValidationErrors(formEl);
    Object.entries(validation).forEach(([field, msgs]) => {
      const input =
        formEl.querySelector(`[name="${field}"]`) ||
        formEl.querySelector(`#${field}`) ||
        formEl.querySelector(`#employee${capitalize(field)}`);
      if (!input) return;
      input.classList.add("input--invalid");
      const message = Array.isArray(msgs) ? msgs.join(" ") : String(msgs);
      const group = input.closest(".form-group") || input.parentElement;
      group
        .querySelectorAll(".field-error, .error-message, .invalid-feedback")
        .forEach((el) => el.remove());
      const errorEl = document.createElement("div");
      errorEl.className = "field-error";
      errorEl.textContent = message;
      group.appendChild(errorEl);
    });
    const first = formEl.querySelector(".input--invalid");
    if (first) first.focus();
  }

  function getDuplicateEmailMessage(error) {
    const emailErrors = error?.validationErrors?.email;
    if (Array.isArray(emailErrors) && emailErrors.length) {
      return emailErrors.join(" ");
    }

    const message = error?.message || "";
    const lowered = message.toLowerCase();
    if (
      error?.status === 409 &&
      (lowered.includes("email") ||
        lowered.includes("duplicate") ||
        lowered.includes("conflict"))
    ) {
      return "This email already exists. Please use a different email.";
    }

    if (
      lowered.includes("email") &&
      (lowered.includes("already") ||
        lowered.includes("exists") ||
        lowered.includes("duplicate"))
    ) {
      return "This email already exists. Please use a different email.";
    }

    return null;
  }

  // Real-time Email Duplicate Check
  emailInput?.addEventListener("blur", async () => {
    const group = emailInput.closest(".form-group") || emailInput.parentElement;
    group?.querySelectorAll(".field-error, .error-message, .invalid-feedback").forEach((el) => el.remove());
    emailInput.classList.remove("input--invalid");

    const emailVal = emailInput.value.trim();
    if (!emailVal) return;

    try {
      const currentId = employeeFormMode === "edit" ? editingEmployeeId : null;
      const res = await checkEmailExists(emailVal, currentId);
      if (res && res.exists) {
        emailInput.classList.add("input--invalid");
        group?.querySelectorAll(".field-error, .error-message, .invalid-feedback").forEach((el) => el.remove());
        const errorEl = document.createElement("div");
        errorEl.className = "field-error";
        errorEl.textContent =
          "An employee with this email already exists. Please use a different email.";
        group.appendChild(errorEl);
      }
    } catch (e) {
      console.warn("Email existence check failed", e);
    }
  });

  // Handle Enter on search input
  searchInput?.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    await searchEmployeeById(state);
  });

  // Handle Refresh button
  refreshButton?.addEventListener("click", async () => {
    await withButtonLoading(refreshButton, "Refreshing...", async () => {
      if (searchInput) searchInput.value = "";
      state.searchId = null;
      state.page = 0;
      await loadEmployeeList(state);
    });
  });

  // Always bind page-level Add Employee button click on Employees page render
  if (addButton) {
    addButton.onclick = () => openEmployeeModal();
  }

  // Handle Modal buttons once per SPA lifecycle
  if (!modalListenersInitialized && form) {
    form.dataset.initialized = "true";
    window.__employeeFormListenersBound = true;
    console.count("Employee Form Listener Registered");

    cancelButton?.addEventListener("click", closeEmployeeModal);
    closeButton?.addEventListener("click", closeEmployeeModal);
    backdrop?.addEventListener("click", closeEmployeeModal);

    form.addEventListener("reset", () => {
      resetEmployeeFormState();
    });

    form.addEventListener("submit", async (event) => {
      console.count("Employee Form Submitted");
      event.preventDefault();
      event.stopImmediatePropagation();
      if (state.isSubmitting) return;
      await submitEmployeeForm(state);
    });
  }

  // Handle Pagination clicks & Go-to-page input Jumps
  async function triggerPageChange(newPage) {
    if (newPage < 0 || newPage >= state.totalPages) return;
    state.page = newPage;

    if (tableSection) {
      tableSection.classList.add("fade-transition", "fade-out");
    }

    await new Promise((r) => setTimeout(r, 150));
    await loadEmployeeList(state);

    if (tableSection) {
      tableSection.classList.remove("fade-out");
      tableSection.classList.add("fade-in");
      setTimeout(
        () => tableSection.classList.remove("fade-in", "fade-transition"),
        250,
      );
    }
  }

  pagination?.addEventListener("click", async (event) => {
    if (handleGotoPageClick(event, triggerPageChange)) {
      return;
    }

    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) {
      return;
    }

    const newPage = Number(button.dataset.page);
    await triggerPageChange(newPage);
  });

  pagination?.addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
      handleGotoPageClick(event, triggerPageChange);
    }
  });

  // Handle Table Action clicks
  tableBody?.addEventListener("click", async (event) => {
    const row = event.target.closest("tr[data-id]");
    if (!row) {
      return;
    }

    const employeeId = Number(row.dataset.id);
    const action = event.target.closest("button[data-action]");
    if (!action) {
      return;
    }

    const employee = state.employees.find((item) => item.id === employeeId);
    if (!employee) {
      return;
    }

    const type = action.dataset.action;
    if (type === "view") {
      openEmployeeModal(employee, true);
    } else if (type === "edit") {
      openEmployeeModal(employee, false);
    } else if (type === "delete") {
      await deleteEmployeeRecord(employee, state, action);
    }
  });

  // Escape key handler for modal
  function handleModalKeydown(event) {
    if (event.key === "Escape" && modal.classList.contains("is-visible")) {
      closeEmployeeModal();
    }
  }

  await Promise.all([
    populateFormOptions("department"),
    populateFormOptions("designation"),
  ]);
  await loadEmployeeList(state);

  function showStatus(message, type = "info") {
    if (!status) return;
    status.textContent = message;
    status.className = "page-state";
    if (type === "error") {
      status.classList.add("page-state--error");
    }
  }

  async function populateFormOptions(field) {
    const select = document.getElementById(`employee${capitalize(field)}`);
    if (!select) {
      return;
    }

    select.innerHTML = "";
    select.append(createOption("", `Select ${capitalize(field)}`));

    try {
      const options = await getSummary(field);
      (options || []).forEach((item) => {
        select.append(createOption(item.name, item.name));
      });
    } catch (error) {
      console.error(`Failed to load ${field} options`, error);
      select.innerHTML = "";
      select.append(createOption("", `Unable to load ${field}`));
    }
  }

  async function loadEmployeeList(state) {
    showStatus("Loading employees…");
    if (pageInfo) pageInfo.textContent = "";
    if (tableBody) tableBody.innerHTML = renderTableSkeletons(6, 5);
    setLoading(true);

    try {
      const response = await getEmployees({
        page: state.page,
        size: PAGE_SIZE,
      });
      state.employees = response.content ?? [];
      state.totalPages = response.totalPages ?? 1;
      renderEmployees(state);
      if (pagination) pagination.innerHTML = renderPagination(response);
      if (pageInfo) {
        pageInfo.textContent = `Page ${response.currentPage + 1} of ${response.totalPages}`;
      }
      showStatus(
        `${response.totalElements} employee${response.totalElements === 1 ? "" : "s"} found.`,
      );
    } catch (error) {
      console.error("Failed to load employees", error);
      showStatus("Unable to load employee list.", "error");
      if (tableBody) tableBody.innerHTML = "";
      if (pagination) pagination.innerHTML = "";
      if (pageInfo) pageInfo.textContent = "";
    } finally {
      setLoading(false);
    }
  }

  async function searchEmployeeById(state) {
    const searchValue = searchInput ? searchInput.value.trim() : "";
    if (!searchValue) {
      state.searchId = null;
      state.page = 0;
      await loadEmployeeList(state);
      return;
    }

    const id = Number(searchValue);
    if (Number.isNaN(id) || id <= 0) {
      showStatus("Enter a valid numeric employee ID.", "error");
      showToast("Please enter a valid numeric Employee ID.", "error");
      return;
    }

    state.searchId = id;
    showStatus(`Searching employee #${id}…`);
    if (tableBody) tableBody.innerHTML = renderTableSkeletons(6, 1);
    setLoading(true);

    try {
      const employee = await getEmployee(id);
      state.employees = employee ? [employee] : [];
      state.totalPages = 1;
      renderEmployees(state);
      if (pagination) pagination.innerHTML = "";
      if (pageInfo)
        pageInfo.textContent = employee
          ? "Search result"
          : "No employee found.";
      showStatus(
        employee ? `Employee #${id} found.` : `Employee #${id} not found.`,
        employee ? "info" : "error",
      );
      if (!employee) {
        showToast(`Employee #${id} not found.`, "error");
      }
    } catch (error) {
      console.error("Employee search failed", error);
      if (tableBody) tableBody.innerHTML = "";
      if (pagination) pagination.innerHTML = "";
      if (pageInfo) pageInfo.textContent = "";
      showStatus(
        `Employee #${id} not found. Check the ID and try again.`,
        "error",
      );
      showToast(`Employee #${id} could not be found.`, "error");
    } finally {
      setLoading(false);
    }
  }

  // Expose triggers globally for quick actions from dashboard
  window.triggerEmployeeSearchById = async function (id) {
    if (!id) return;
    if (searchInput) searchInput.value = String(id).trim();
    await searchEmployeeById(state);
  };

  window.triggerEmployeeDeleteById = async function (id) {
    if (!id) return;
    try {
      const emp = await getEmployee(id);
      if (emp) {
        await deleteEmployeeRecord(emp, state);
      }
    } catch (e) {
      showToast(`Employee #${id} not found.`, "error");
    }
  };

  function renderEmployees(state) {
    if (!tableBody) return;

    const rows = state.employees.length
      ? state.employees.map(renderEmployeeRow).join("")
      : `
        <tr class="empty-row">
          <td colspan="6">
            No employee records found.
          </td>
        </tr>
      `;

    tableBody.innerHTML = rows;
    window.lucide?.createIcons();
  }

  function renderEmployeeRow(employee) {
    return `
      <tr data-id="${employee.id}">
        <td>${escapeHtml(employee.id)}</td>
        <td>${escapeHtml(employee.name)}</td>
        <td>${escapeHtml(employee.department)}</td>
        <td>${escapeHtml(employee.designation)}</td>
        <td>${formatCurrency(employee.salary)}</td>
        <td>
          <div class="table-actions">
            <button class="view-button" type="button" data-action="view" aria-label="View ${escapeHtml(employee.name)}">
              <i data-lucide="eye"></i>
            </button>
            <button class="edit-button" type="button" data-action="edit" aria-label="Edit ${escapeHtml(employee.name)}">
              <i data-lucide="square-pen"></i>
            </button>
            <button class="delete-button" type="button" data-action="delete" aria-label="Delete ${escapeHtml(employee.name)}">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value ?? "—";
    return element.innerHTML;
  }

  async function submitEmployeeForm(state) {
    if (state.isSubmitting) return;
    clearValidationErrors(form);

    if (!form) return;

    const formData = new FormData(form);
    const employee = {
      name: formData.get("name")?.trim() || "",
      email: formData.get("email")?.trim() || "",
      department: formData.get("department")?.trim() || "",
      designation: formData.get("designation")?.trim() || "",
      salary: parseFloat(formData.get("salary")) || 0,
      joiningDate: formData.get("joiningDate") || "",
    };

    if (
      !employee.name ||
      !employee.email ||
      !employee.department ||
      !employee.designation ||
      !employee.joiningDate
    ) {
      showStatus("Please complete all required fields.", "error");
      showToast("Please fill in all required form fields.", "error");
      return;
    }

    const loadingText = employeeFormMode === "edit" ? "Saving..." : "Creating...";

    await withButtonLoading(submitButton, loadingText, async () => {
      state.isSubmitting = true;
      if (cancelButton) cancelButton.disabled = true;
      showStatus(
        employeeFormMode === "edit" ? "Updating employee…" : "Adding employee...",
      );

      try {
        if (employeeFormMode === "edit" && editingEmployeeId) {
          const updated = await updateEmployee(editingEmployeeId, employee);
          showStatus("Employee updated successfully.");
          showToast(
            `Employee "${updated.name}" (#${updated.id}) updated.`,
            "success",
          );
        } else {
          const created = await createEmployee(employee);
          showStatus("Employee created successfully.");
          showToast(
            `Employee "${created.name}" (#${created.id}) created.`,
            "success",
          );
        }

        closeEmployeeModal();
        window.dispatchEvent(new CustomEvent("employee-updated"));
        await loadEmployeeList(state);
      } catch (error) {
        console.error("Employee save failed", error);

        const duplicateEmailMessage = getDuplicateEmailMessage(error);
        if (duplicateEmailMessage) {
          applyValidationErrors({ email: [duplicateEmailMessage] }, form);
          showToast(duplicateEmailMessage, "error", 6000);
          showStatus("This email is already in use.", "error");
        } else {
          const validation = error?.validationErrors ?? {};
          if (validation && Object.keys(validation).length) {
            applyValidationErrors(validation, form);
            const messages = Object.values(validation)
              .flat()
              .map((m) => (typeof m === "string" ? m : JSON.stringify(m)));
            showToast(messages.join(" — "), "error", 6000);
            showStatus("Validation failed. Check the form fields.", "error");
          } else {
            showToast(error?.message || "Unable to save employee.", "error");
            showStatus(
              "Unable to save employee. Check the form and try again.",
              "error",
            );
          }
        }
      } finally {
        state.isSubmitting = false;
        if (cancelButton) cancelButton.disabled = false;
      }
    });
  }

  function openEmployeeModal(employee = null, readonly = false) {
    resetEmployeeFormState();
    clearValidationErrors(form);

    const isView = Boolean(readonly);

    if (employee && !isView) {
      employeeFormMode = "edit";
      editingEmployeeId = employee.id;
      state.activeEmployee = employee;
    } else if (employee && isView) {
      employeeFormMode = "view";
      editingEmployeeId = employee.id;
      state.activeEmployee = employee;
    } else {
      employeeFormMode = "create";
      editingEmployeeId = null;
      state.activeEmployee = null;
    }

    console.log("Mode:", employeeFormMode);
    console.log("Employee:", editingEmployeeId);

    const formTitle = document.getElementById("employeeFormTitle");
    const formSubtitle = document.getElementById("employeeFormSubtitle");

    if (employee) {
      if (form.elements.name) form.elements.name.value = employee.name ?? "";
      if (form.elements.email) form.elements.email.value = employee.email ?? "";
      if (form.elements.department)
        form.elements.department.value = employee.department ?? "";
      if (form.elements.designation)
        form.elements.designation.value = employee.designation ?? "";
      if (form.elements.salary)
        form.elements.salary.value =
          employee.salary != null ? Number(employee.salary).toFixed(2) : "";
      if (form.elements.joiningDate)
        form.elements.joiningDate.value = employee.joiningDate ?? "";
      if (employeeIdInput) employeeIdInput.value = employee.id;
      if (employeeIdGroup) employeeIdGroup.style.display = "block";

      if (formTitle)
        formTitle.textContent = isView
          ? `View Employee #${employee.id}`
          : "Edit Employee";
      if (formSubtitle)
        formSubtitle.textContent = isView
          ? "Employee details (Read-only)."
          : "Modify employee profile details.";
    } else {
      if (employeeIdInput) employeeIdInput.value = "";
      if (employeeIdGroup) employeeIdGroup.style.display = "none";
      if (formTitle) formTitle.textContent = "Add Employee";
      if (formSubtitle)
        formSubtitle.textContent = "Enter details for the new employee record.";
    }

    if (form && isView) {
      Array.from(form.elements).forEach((element) => {
        if (element.type !== "button" && element.type !== "submit") {
          element.disabled = true;
        }
      });
    }

    if (cancelButton) {
      cancelButton.textContent = isView ? "Close" : "Cancel";
      cancelButton.style.display = isView ? "none" : "inline-flex";
    }

    if (submitButton) {
      submitButton.textContent = isView
        ? "Close"
        : employeeFormMode === "edit"
          ? "Save Changes"
          : "Create Employee";
      submitButton.style.display = isView ? "none" : "inline-flex";
    }

    showModal(modal);
    document.addEventListener("keydown", handleModalKeydown);
  }

  function closeEmployeeModal() {
    hideModal(modal);
    clearValidationErrors(form);
    resetEmployeeFormState();
    state.activeEmployee = null;
    state.isSubmitting = false;
    document.removeEventListener("keydown", handleModalKeydown);
  }

  function showModal(modal) {
    if (!modal) return;
    modal.classList.add("is-visible");
    if (backdrop) backdrop.classList.add("is-visible");
    document.body.classList.add("no-scroll");
  }

  function hideModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-visible");
    if (backdrop) backdrop.classList.remove("is-visible");
    document.body.classList.remove("no-scroll");
  }

  async function deleteEmployeeRecord(employee, state, actionButton = null) {
    if (state.isSubmitting) return;
    if (!employee?.id) return;

    const confirmed = await showConfirm({
      title: "Confirm Delete",
      message: `Are you sure you want to delete employee "${employee.name}" (#${employee.id})? This action cannot be undone.`,
      confirmText: "Delete Employee",
      cancelText: "Cancel",
    });

    if (!confirmed) {
      return;
    }

    await withButtonLoading(actionButton, "Deleting...", async () => {
      state.isSubmitting = true;
      showStatus(`Deleting employee #${employee.id}…`);

      try {
        await deleteEmployee(employee.id);
        showStatus("Employee removed.");
        showToast(
          `Employee "${employee.name}" (#${employee.id}) deleted successfully.`,
          "success",
        );
        window.dispatchEvent(new CustomEvent("employee-updated"));

        if (state.employees.length === 1 && state.page > 0) {
          state.page -= 1;
        }
        await loadEmployeeList(state);
      } catch (error) {
        console.error("Delete failed", error);
        showStatus("Unable to delete employee.", "error");
        showToast(error?.message || "Failed to delete employee.", "error");
      } finally {
        state.isSubmitting = false;
      }
    });
  }

  function setLoading(loading) {
    if (refreshButton) refreshButton.disabled = loading;
    if (addButton) addButton.disabled = loading;
    if (searchInput) searchInput.disabled = loading;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  window.openEmployeeModal = openEmployeeModal;
}
