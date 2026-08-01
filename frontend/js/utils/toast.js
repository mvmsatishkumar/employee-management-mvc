let toastContainer = null;
const activeToastsMap = new Map(); // key -> { element, timer }
const MAX_VISIBLE_TOASTS = 3;

function getToastContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.querySelector(".toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.className = "toast-container";
      toastContainer.setAttribute("role", "region");
      toastContainer.setAttribute("aria-label", "Notifications");
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

export function showToast(message, type = "success", timeout = 4000) {
  if (!message) return;
  const msgKey = `${type}:${message.trim()}`;

  const container = getToastContainer();

  // Deduplicate: If an active toast with the same key is already visible, refresh its timer
  if (activeToastsMap.has(msgKey)) {
    const existing = activeToastsMap.get(msgKey);
    if (existing && container.contains(existing.element)) {
      clearTimeout(existing.timer);
      existing.timer = setTimeout(() => {
        dismissToast(existing.element, msgKey);
      }, timeout);

      // Flash pulse animation to indicate repeat
      existing.element.classList.remove("toast-bounce");
      void existing.element.offsetWidth; // trigger reflow
      existing.element.classList.add("toast-bounce");
      return;
    }
  }

  // Limit max visible toasts to 3
  const currentToasts = container.querySelectorAll(".toast");
  if (currentToasts.length >= MAX_VISIBLE_TOASTS) {
    const oldest = currentToasts[0];
    const oldestKey = oldest.dataset.key;
    if (oldestKey) activeToastsMap.delete(oldestKey);
    oldest.classList.remove("is-visible");
    oldest.remove();
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "polite");
  toast.dataset.key = msgKey;

  const iconMarkup =
    type === "success"
      ? `<i data-lucide="check-circle" aria-hidden="true"></i>`
      : type === "error"
      ? `<i data-lucide="alert-circle" aria-hidden="true"></i>`
      : `<i data-lucide="info" aria-hidden="true"></i>`;

  toast.innerHTML = `
    <span class="toast-icon">${iconMarkup}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  window.lucide?.createIcons({ targets: [toast] });

  requestAnimationFrame(() => {
    toast.classList.add("is-visible");
  });

  const timer = setTimeout(() => {
    dismissToast(toast, msgKey);
  }, timeout);

  activeToastsMap.set(msgKey, { element: toast, timer });

  toast.addEventListener("click", () => {
    const current = activeToastsMap.get(msgKey);
    if (current) clearTimeout(current.timer);
    dismissToast(toast, msgKey);
  });
}

function dismissToast(toast, msgKey) {
  toast.classList.remove("is-visible");
  setTimeout(() => {
    toast.remove();
    activeToastsMap.delete(msgKey);
  }, 250);
}

function escapeHtml(value) {
  const el = document.createElement("span");
  el.textContent = value ?? "";
  return el.innerHTML;
}
