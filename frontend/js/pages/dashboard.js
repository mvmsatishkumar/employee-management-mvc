import { getDashboard, getEmployee, deleteEmployee } from "../services/employeeService.js";
import { showConfirm, showPrompt } from "../utils/confirmModal.js";
import { showToast } from "../utils/toast.js";
import { formatCurrency } from "../utils/formatCurrency.js";
import { formatDate } from "../utils/formatters.js";
import { animateCounter } from "../utils/animateCounter.js";
import { renderTableSkeletons } from "../components/skeletonLoader.js";
import { withButtonLoading } from "../utils/loading.js";

export async function loadDashboard() {
  const employeeCountEl = document.getElementById("employeeCount");
  const departmentCountEl = document.getElementById("departmentCount");
  const designationCountEl = document.getElementById("designationCount");
  const averageSalaryEl = document.getElementById("averageSalary");
  const recentTbody = document.getElementById("dashboardRecentTbody");
  const refreshBtn = document.getElementById("dashboardRefreshBtn");
  const viewAllLink = document.getElementById("dashboardViewAllLink");

  const quickAddBtn = document.getElementById("quickAddEmployeeBtn");
  const quickSearchBtn = document.getElementById("quickSearchEmployeeBtn");
  const quickDeleteBtn = document.getElementById("quickDeleteEmployeeBtn");

  let currentMetrics = {
    totalEmployees: 0,
    totalDepartments: 0,
    totalDesignations: 0,
    averageSalary: 0,
  };

  function escapeHtml(value) {
    const el = document.createElement("span");
    el.textContent = value ?? "";
    return el.innerHTML;
  }

  async function refresh() {
    if (recentTbody) {
      recentTbody.innerHTML = renderTableSkeletons(4, 5);
    }

    try {
      const data = await getDashboard();

      const newTotalEmployees = data?.totalEmployees ?? 0;
      const newTotalDepartments = data?.totalDepartments ?? 0;
      const newTotalDesignations = data?.totalDesignations ?? 0;
      const newAverageSalary = data?.averageSalary ?? 0;

      // Animate stat counters smoothly
      if (employeeCountEl) {
        animateCounter(employeeCountEl, newTotalEmployees, currentMetrics.totalEmployees);
      }
      if (departmentCountEl) {
        animateCounter(departmentCountEl, newTotalDepartments, currentMetrics.totalDepartments);
      }
      if (designationCountEl) {
        animateCounter(designationCountEl, newTotalDesignations, currentMetrics.totalDesignations);
      }
      if (averageSalaryEl) {
        animateCounter(averageSalaryEl, newAverageSalary, currentMetrics.averageSalary, 800, formatCurrency);
      }

      currentMetrics = {
        totalEmployees: newTotalEmployees,
        totalDepartments: newTotalDepartments,
        totalDesignations: newTotalDesignations,
        averageSalary: newAverageSalary,
      };

      const recent = data?.recentEmployees ?? [];

      if (recentTbody) {
        recentTbody.innerHTML = recent.length
          ? recent
              .map(
                (employee) => `
                  <tr>
                    <td>${escapeHtml(employee.name)}</td>
                    <td>${escapeHtml(employee.department)}</td>
                    <td>${formatCurrency(employee.salary)}</td>
                    <td>${formatDate(employee.joiningDate)}</td>
                  </tr>
                `,
              )
              .join("")
          : `
              <tr class="empty-row">
                <td colspan="4">No recent employees found.</td>
              </tr>
            `;
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
      showToast("Failed to load dashboard data.", "error");
      if (recentTbody) {
        recentTbody.innerHTML = `
          <tr class="empty-row">
            <td colspan="4">Unable to load recent employees.</td>
          </tr>
        `;
      }
    }
  }

  // Refresh button action
  refreshBtn?.addEventListener("click", async () => {
    await withButtonLoading(refreshBtn, "Refreshing...", async () => {
      await refresh();
      showToast("Dashboard refreshed.", "success");
    });
  });

  // View All link action
  viewAllLink?.addEventListener("click", (e) => {
    e.preventDefault();
    const nav = document.querySelector('.nav-item[data-page="employees"]');
    nav?.click();
  });

  // Quick Action 1: Add Employee
  quickAddBtn?.addEventListener("click", async () => {
    try {
      if (window.openEmployeeModal) {
        window.openEmployeeModal();
      } else {
        const nav = document.querySelector('.nav-item[data-page="employees"]');
        nav?.click();
        const onReady = (ev) => {
          if (ev?.detail?.page === "employees") {
            window.removeEventListener("page-ready", onReady);
            window.openEmployeeModal?.();
          }
        };
        window.addEventListener("page-ready", onReady);
      }
    } catch (e) {
      console.error("Failed to open add employee modal", e);
    }
  });

  // Quick Action 2: Search Employee by ID
  quickSearchBtn?.addEventListener("click", async () => {
    const rawId = await showPrompt({
      title: "Search employee",
      message: "Enter numeric employee ID to view details:",
      placeholder: "e.g. 1",
      inputType: "number",
    });

    if (!rawId) return;

    const id = Number(rawId);
    if (Number.isNaN(id) || id <= 0) {
      showToast("Please enter a valid numeric Employee ID.", "error");
      return;
    }

    try {
      const employee = await getEmployee(id);
      if (!employee) {
        showToast(`Employee #${id} not found.`, "error");
        return;
      }

      if (window.openEmployeeModal) {
        window.openEmployeeModal(employee, true);
      } else {
        const nav = document.querySelector('.nav-item[data-page="employees"]');
        nav?.click();
        const onReady = (ev) => {
          if (ev?.detail?.page === "employees") {
            window.removeEventListener("page-ready", onReady);
            window.openEmployeeModal?.(employee, true);
          }
        };
        window.addEventListener("page-ready", onReady);
      }
    } catch (error) {
      console.error("Failed to fetch employee", error);
      showToast(`Employee #${id} could not be found.`, "error");
    }
  });

  // Quick Action 3: Delete Employee
  quickDeleteBtn?.addEventListener("click", async () => {
    const rawId = await showPrompt({
      title: "Delete employee",
      message: "Enter employee ID to delete:",
      placeholder: "e.g. 1",
      inputType: "number",
    });

    if (!rawId) return;

    const id = Number(rawId);
    if (Number.isNaN(id) || id <= 0) {
      showToast("Please enter a valid numeric Employee ID.", "error");
      return;
    }

    // Verify employee exists first
    let employee = null;
    try {
      employee = await getEmployee(id);
    } catch (e) {
      showToast(`Employee #${id} not found.`, "error");
      return;
    }

    const confirmed = await showConfirm({
      title: "Confirm Delete",
      message: `Are you sure you want to delete employee "${employee.name}" (#${id})? This action cannot be undone.`,
      confirmText: "Delete Employee",
      cancelText: "Cancel",
    });

    if (!confirmed) return;

    await withButtonLoading(quickDeleteBtn, "Deleting...", async () => {
      try {
        await deleteEmployee(id);
        showToast(`Employee #${id} deleted successfully.`, "success");
        await refresh();
      } catch (err) {
        console.error("Delete failed", err);
        showToast(err?.message || `Failed to delete employee #${id}.`, "error");
      }
    });
  });

  // Global listener to refresh dashboard when CRUD completes elsewhere
  window.addEventListener("employee-updated", () => {
    refresh().catch(() => {});
  });

  await refresh();
}
