export function renderPagination(pageData) {
  if (!pageData) {
    return "";
  }

  const {
    currentPage = 0,
    totalPages = 1,
    totalElements = 0,
    size = 10,
    first = true,
    last = true,
  } = pageData;

  if (totalPages <= 1 && totalElements <= 0) {
    return "";
  }

  const startRecord = totalElements > 0 ? currentPage * size + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * size, totalElements);
  const infoText = totalElements > 0
    ? `Showing ${startRecord}–${endRecord} of ${totalElements} employee${totalElements === 1 ? "" : "s"}`
    : "No records to display";

  if (totalPages <= 1) {
    return `
      <div class="pagination-container">
        <span class="pagination-info">${infoText}</span>
      </div>
    `;
  }

  return `
    <div class="pagination-container">
      <span class="pagination-info">${infoText}</span>

      <div class="pagination-controls">
        <button
          class="secondary-button pagination-btn"
          type="button"
          data-page="${currentPage - 1}"
          ${first || currentPage === 0 ? "disabled" : ""}
          aria-label="Previous Page"
        >
          <i data-lucide="chevron-left" aria-hidden="true"></i>
          <span>Previous</span>
        </button>

        <div class="goto-group" title="Jump directly to page">
          <label for="gotoPageInput" class="goto-label">Page</label>
          <input
            id="gotoPageInput"
            class="goto-input"
            type="number"
            min="1"
            max="${totalPages}"
            value="${currentPage + 1}"
            aria-label="Target page number"
          />
          <span class="goto-total">of ${totalPages}</span>
          <button
            class="secondary-button goto-btn"
            type="button"
            data-max="${totalPages}"
            aria-label="Go to specified page"
          >
            Go
          </button>
        </div>

        <button
          class="secondary-button pagination-btn"
          type="button"
          data-page="${currentPage + 1}"
          ${last || currentPage >= totalPages - 1 ? "disabled" : ""}
          aria-label="Next Page"
        >
          <span>Next</span>
          <i data-lucide="chevron-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  `;
}

export function handleGotoPageClick(event, onPageChange) {
  const gotoBtn = event.target.closest(".goto-btn");
  const gotoInput = event.target.closest(".goto-input");
  const gotoGroup = event.target.closest(".goto-group");

  if (gotoGroup && (gotoBtn || (gotoInput && event.key === "Enter"))) {
    if (event.key === "Enter") event.preventDefault();

    const input = gotoGroup.querySelector(".goto-input");
    const btn = gotoGroup.querySelector(".goto-btn");
    const max = Number(btn?.dataset.max || input?.max) || 1;

    if (input) {
      const pageNum = Number(input.value);
      if (!Number.isNaN(pageNum) && pageNum >= 1 && pageNum <= max) {
        onPageChange(pageNum - 1);
        return true;
      }
    }
  }

  return false;
}

