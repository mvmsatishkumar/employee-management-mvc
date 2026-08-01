import { getSummary } from "../services/summaryService.js";
import { getEmployees } from "../services/employeeService.js";
import { renderSummaryTable } from "./summaryTable.js";
import {
  createSummaryModal,
  renderSummaryModalEmployees,
} from "../utils/summaryModal.js";
import { handleGotoPageClick } from "../components/pagination.js";
import { renderTableSkeletons } from "../components/skeletonLoader.js";
import { showToast } from "../utils/toast.js";
import { withButtonLoading } from "../utils/loading.js";

const PAGE_SIZE = 10;

export async function loadSummaryPage(field, title, forceRefresh = false) {
  const container = document.getElementById("summary-container");
  const refreshBtn = document.getElementById("refreshSummaryButton");

  if (refreshBtn && !refreshBtn.dataset.bound) {
    refreshBtn.dataset.bound = "true";
    refreshBtn.onclick = async () => {
      await withButtonLoading(refreshBtn, "Refreshing...", async () => {
        await loadSummaryPage(field, title, true);
        showToast(`${title}s refreshed.`, "success");
      });
    };
  }

  if (!container) {
    console.error("summary-container not found");
    return;
  }

  try {
    const summary = await getSummary(field, forceRefresh);

    if (!summary || !summary.length) {
      container.innerHTML = `
        <div class="empty-state" style="padding:40px;text-align:center;">
          <p class="muted-text">No ${title.toLowerCase()} records found.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = renderSummaryTable(summary, title);
    window.lucide?.createIcons();

    enhanceSummaryInteractions(container, field, title);
  } catch (error) {
    console.error(`Failed to load ${title.toLowerCase()}s`, error);
    container.innerHTML = `
      <div class="empty-state" style="padding:40px;text-align:center;">
        <p class="muted-text">Failed to load ${title.toLowerCase()}s summary. Please try again.</p>
      </div>
    `;
    showToast(`Unable to load ${title.toLowerCase()} summary data.`, "error");
  }
}

function enhanceSummaryInteractions(container, field, title) {
  const searchInput = container.querySelector("#summary-search");
  const table = container.querySelector(".summary-table");
  const tbody = table?.querySelector("tbody");

  if (searchInput && tbody) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.trim().toLowerCase();
      Array.from(tbody.rows).forEach((row) => {
        const name = row.cells[0]?.textContent?.trim()?.toLowerCase() || "";
        row.style.display = name.includes(q) ? "" : "none";
      });
    });
  }

  container.addEventListener("click", async (ev) => {
    const btn = ev.target.closest(".view-button");
    if (!btn) return;
    const row = btn.closest("tr");
    if (!row) return;
    const value = row.cells[0]?.textContent?.trim();
    if (!value) return;

    const modalState = {
      field,
      value,
      page: 0,
      title: `${value} — Personnel`,
      subtitle: `Viewing employees assigned to ${value}`,
    };

    await withButtonLoading(btn, "...", async () => {
      try {
        await loadSummaryModalEmployees(modalState);
      } catch (error) {
        console.error(`Failed to load employees for ${value}`, error);
        showToast(`Unable to load employees for ${value}.`, "error");
      }
    });
  });
}

async function loadSummaryModalEmployees({
  field,
  value,
  page,
  title,
  subtitle,
}) {
  const { modal, backdrop, elements } = createSummaryModal();

  elements.body.innerHTML = renderTableSkeletons(4, 5);

  modal.classList.add("is-visible");
  backdrop.classList.add("is-visible");
  document.body.classList.add("no-scroll");

  const response = await getEmployees({
    [field]: value,
    page,
    size: PAGE_SIZE,
  });

  const employees = response.content ?? [];
  const responsePage = response.currentPage ?? page;
  const totalPages = response.totalPages ?? 1;

  const render = renderSummaryModalEmployees({
    employees,
    page: responsePage,
    totalPages,
    title,
    subtitle,
  });

  elements.title.textContent = render.title;
  elements.subtitle.textContent = render.subtitle;
  elements.info.textContent = `${response.totalElements ?? employees.length} employee${(response.totalElements ?? employees.length) === 1 ? "" : "s"}`;
  elements.pageStatus.textContent = render.pageStatus;
  elements.body.innerHTML = render.rows;
  elements.pagination.innerHTML = render.pagination;

  async function triggerPageChange(newPage) {
    if (newPage < 0 || newPage >= totalPages) return;
    await loadSummaryModalEmployees({
      field,
      value,
      page: newPage,
      title,
      subtitle,
    });
  }

  elements.pagination.onclick = async (event) => {
    if (handleGotoPageClick(event, triggerPageChange)) {
      return;
    }

    const button = event.target.closest("button[data-page]");
    if (!button || button.disabled) return;
    const nextPage = Number(button.dataset.page);
    await triggerPageChange(nextPage);
  };

  elements.pagination.onkeydown = async (event) => {
    if (event.key === "Enter") {
      handleGotoPageClick(event, triggerPageChange);
    }
  };
}
