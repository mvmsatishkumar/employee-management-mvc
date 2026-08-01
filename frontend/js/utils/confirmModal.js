function showFloatingModal(backdrop, modal) {
  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  document.body.classList.add("no-scroll");

  requestAnimationFrame(() => {
    backdrop.classList.add("is-visible");
    modal.classList.add("is-visible");
  });
}

function hideFloatingModal(backdrop, modal) {
  backdrop.classList.remove("is-visible");
  modal.classList.remove("is-visible");

  setTimeout(() => {
    backdrop.remove();
    modal.remove();
    if (!document.querySelector(".modal.is-visible")) {
      document.body.classList.remove("no-scroll");
    }
  }, 220);
}

export function showConfirm({
  title = "Confirm",
  message = "",
  confirmText = "OK",
  cancelText = "Cancel",
} = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "confirmModalTitle");

    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 id="confirmModalTitle">${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
          </div>
        </div>
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:8px;padding:16px;">
          <button class="secondary-button cancel-btn" type="button">${escapeHtml(cancelText)}</button>
          <button class="primary-button confirm-btn" type="button">${escapeHtml(confirmText)}</button>
        </div>
      </div>
    `;

    const confirmBtn = modal.querySelector(".confirm-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");

    function cleanup(result) {
      document.removeEventListener("keydown", handleKeydown);
      hideFloatingModal(backdrop, modal);
      resolve(result);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(false);
      }
    }

    document.addEventListener("keydown", handleKeydown);

    confirmBtn.addEventListener("click", () => cleanup(true));
    cancelBtn.addEventListener("click", () => cleanup(false));
    backdrop.addEventListener("click", () => cleanup(false));

    showFloatingModal(backdrop, modal);
    confirmBtn.focus();
  });
}

export function showPrompt({
  title = "Input",
  message = "",
  placeholder = "",
  inputType = "text",
} = {}) {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "promptModalTitle");

    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h3 id="promptModalTitle">${escapeHtml(title)}</h3>
            <p>${escapeHtml(message)}</p>
          </div>
        </div>
        <div style="padding:0 24px 16px 24px;">
          <input class="prompt-input" type="${escapeHtml(inputType)}" placeholder="${escapeHtml(placeholder)}" style="width:100%;padding:10px;border-radius:6px;border:1px solid var(--border);font-size:14px;" />
        </div>
        <div class="modal-actions" style="display:flex;justify-content:flex-end;gap:8px;padding:16px;">
          <button class="secondary-button cancel-btn" type="button">Cancel</button>
          <button class="primary-button confirm-btn" type="button">OK</button>
        </div>
      </div>
    `;

    const input = modal.querySelector(".prompt-input");
    const confirmBtn = modal.querySelector(".confirm-btn");
    const cancelBtn = modal.querySelector(".cancel-btn");

    function cleanup(value) {
      document.removeEventListener("keydown", handleKeydown);
      hideFloatingModal(backdrop, modal);
      resolve(value);
    }

    function handleKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        cleanup(null);
      }
    }

    document.addEventListener("keydown", handleKeydown);

    confirmBtn.addEventListener("click", () => {
      const val = input.value.trim();
      cleanup(val === "" ? null : val);
    });

    cancelBtn.addEventListener("click", () => {
      cleanup(null);
    });

    backdrop.addEventListener("click", () => {
      cleanup(null);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        const val = input.value.trim();
        cleanup(val === "" ? null : val);
      }
    });

    showFloatingModal(backdrop, modal);
    input.focus();
  });
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
