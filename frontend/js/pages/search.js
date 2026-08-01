import { searchEmployees } from "../services/searchService.js";
import { getSummary } from "../services/summaryService.js";
import { renderSearchRows } from "../components/searchTable.js";
import { renderPagination, handleGotoPageClick } from "../components/pagination.js";
import { renderTableSkeletons } from "../components/skeletonLoader.js";
import { showToast } from "../utils/toast.js";
import { withButtonLoading } from "../utils/loading.js";

const PAGE_SIZE = 10;

export async function loadSearch() {
  const form = document.getElementById("searchFilters");
  const departmentSelect = document.getElementById("department");
  const designationSelect = document.getElementById("designation");
  const resetButton = document.getElementById("resetButton");
  const searchButton = document.getElementById("searchButton");
  const resultsSection = document.querySelector(".search-results");
  const tableBody = document.getElementById("employeeTableBody");
  const resultCount = document.getElementById("resultCount");
  const searchState = document.getElementById("searchState");
  const pagination = document.getElementById("searchPagination");

  const state = {
    page: 0,
    totalPages: 1,
    content: [],
    isSubmitting: false,
  };

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
        formEl.querySelector(`#${field}`);
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

  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.isSubmitting) return;
    state.page = 0;
    await performSearch(state);
  });

  resetButton?.addEventListener("click", async () => {
    await withButtonLoading(resetButton, "Resetting...", async () => {
      if (form) form.reset();
      state.page = 0;
      clearValidationErrors(form);
      hideResults();
      if (resultCount) resultCount.textContent = "Use the search form above to load results.";
      showStatus("");
    });
  });

  async function triggerPageChange(newPage) {
    if (newPage < 0 || newPage >= state.totalPages) return;
    state.page = newPage;

    if (resultsSection) {
      resultsSection.classList.add("fade-transition", "fade-out");
    }
    await new Promise((r) => setTimeout(r, 150));
    await performSearch(state);
    if (resultsSection) {
      resultsSection.classList.remove("fade-out");
      resultsSection.classList.add("fade-in");
      setTimeout(
        () => resultsSection.classList.remove("fade-in", "fade-transition"),
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

  await Promise.all([
    populateSelectOptions("department"),
    populateSelectOptions("designation"),
  ]);

  hideResults();

  function hideResults() {
    resultsSection?.classList.add("is-hidden");
    if (tableBody) tableBody.innerHTML = "";
    if (pagination) pagination.innerHTML = "";
    showStatus("");
  }

  function showResults() {
    resultsSection?.classList.remove("is-hidden");
  }

  async function performSearch(state) {
    clearValidationErrors(form);
    const criteria = getSearchCriteria();

    if (criteria.minSalary !== undefined && Number(criteria.minSalary) < 0) {
      showToast("Minimum salary must be 0 or greater.", "error");
      showStatus("Validation failed: Minimum salary must be 0 or greater.", "error");
      return;
    }

    if (criteria.maxSalary !== undefined && Number(criteria.maxSalary) < 0) {
      showToast("Maximum salary must be 0 or greater.", "error");
      showStatus("Validation failed: Maximum salary must be 0 or greater.", "error");
      return;
    }

    if (
      criteria.minSalary !== undefined &&
      criteria.maxSalary !== undefined &&
      Number(criteria.minSalary) > Number(criteria.maxSalary)
    ) {
      showToast("Minimum salary cannot be greater than Maximum salary.", "error");
      showStatus("Validation failed: Minimum salary cannot exceed Maximum salary.", "error");
      return;
    }

    await withButtonLoading(searchButton, "Searching...", async () => {
      state.isSubmitting = true;
      if (resultCount) resultCount.textContent = "Searching for employees…";
      showResults();
      if (tableBody) tableBody.innerHTML = renderTableSkeletons(6, 5);
      showStatus("");

      try {
        const response = await searchEmployees({
          ...criteria,
          page: state.page,
          size: PAGE_SIZE,
        });

        state.content = response.content ?? [];
        state.totalPages = response.totalPages ?? 1;
        renderResults(response, state);
      } catch (error) {
        console.error("Employee search failed", error);
        if (tableBody) tableBody.innerHTML = "";
        if (pagination) pagination.innerHTML = "";
        if (resultCount) resultCount.textContent = "Unable to load search results.";

        const validation = error?.validationErrors ?? {};
        if (validation && Object.keys(validation).length) {
          applyValidationErrors(validation, form);
          const messages = Object.values(validation)
            .flat()
            .map((m) => (typeof m === "string" ? m : JSON.stringify(m)));
          showToast(messages.join(" — "), "error", 6000);
          showStatus("Validation failed. Adjust search filters.", "error");
        } else {
          showToast(error?.message || "Unable to perform search.", "error");
          showStatus("Please try again or adjust your search filters.", "error");
        }
      } finally {
        state.isSubmitting = false;
      }
    });
  }

  function getSearchCriteria() {
    if (!form) return {};
    const formData = new FormData(form);
    const minSalary = formData.get("minSalary");
    const maxSalary = formData.get("maxSalary");

    return {
      department: formData.get("department") || undefined,
      designation: formData.get("designation") || undefined,
      minSalary: minSalary ? Number(minSalary) : undefined,
      maxSalary: maxSalary ? Number(maxSalary) : undefined,
      joiningFrom: formData.get("joiningFrom") || undefined,
      joiningTo: formData.get("joiningTo") || undefined,
      sortField: formData.get("sortField") || undefined,
      sortDirection: formData.get("sortDirection") || undefined,
    };
  }

  function renderResults(response, state) {
    const count = response.totalElements ?? state.content.length;
    const rows = state.content.length
      ? renderSearchRows(state.content)
      : `
        <tr class="empty-row">
          <td colspan="6">
            No employees match your search criteria. Try broadening your filters.
          </td>
        </tr>
      `;

    if (tableBody) tableBody.innerHTML = rows;
    if (pagination) pagination.innerHTML = renderPagination(response);
    if (resultCount) {
      resultCount.textContent = `${count} result${count === 1 ? "" : "s"} found.`;
    }
    showStatus("");
  }

  async function populateSelectOptions(field) {
    const select =
      field === "department" ? departmentSelect : designationSelect;
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

  function showStatus(message, type = "info") {
    if (!searchState) return;
    searchState.textContent = message;
    searchState.className = "search-state";
    if (type === "error") {
      searchState.classList.add("search-state--error");
    }
  }

  function createOption(value, label) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    return option;
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
