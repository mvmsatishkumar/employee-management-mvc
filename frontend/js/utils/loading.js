/**
 * Centralized loading state helper for preventing duplicate requests and showing loading spinners on buttons.
 */

const loadingStateMap = new WeakMap();

/**
 * Shows a loading spinner and custom text on a button, disabling it to prevent duplicate clicks.
 * @param {HTMLButtonElement} button - Target button element
 * @param {string} loadingText - Text to display (e.g., "Creating...", "Saving...")
 * @returns {boolean} true if state was applied, false if button was already loading or invalid
 */
export function showButtonLoading(button, loadingText) {
  if (!button || button.disabled || loadingStateMap.has(button)) {
    return false;
  }

  // Preserve existing width to prevent layout shift
  const rect = button.getBoundingClientRect();
  const currentWidth = rect.width;

  loadingStateMap.set(button, {
    originalHtml: button.innerHTML,
    originalDisabled: button.disabled,
    originalMinWidth: button.style.minWidth,
  });

  if (currentWidth > 0) {
    button.style.minWidth = `${Math.ceil(currentWidth)}px`;
  }

  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.classList.add("is-loading");

  const formattedText = escapeHtml(loadingText || "Loading...");

  button.innerHTML = `
    <span class="btn-spinner" aria-hidden="true"></span>
    <span>${formattedText}</span>
  `;

  return true;
}

/**
 * Restores the original button text, icon, width, and enabled state.
 * @param {HTMLButtonElement} button - Target button element
 */
export function hideButtonLoading(button) {
  if (!button) return;

  const state = loadingStateMap.get(button);
  if (!state) {
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.classList.remove("is-loading");
    return;
  }

  button.innerHTML = state.originalHtml;
  button.disabled = state.originalDisabled ?? false;
  button.style.minWidth = state.originalMinWidth ?? "";
  button.removeAttribute("aria-busy");
  button.classList.remove("is-loading");

  loadingStateMap.delete(button);

  // Re-render lucide icons if button contains [data-lucide]
  if (window.lucide && button.querySelector("[data-lucide]")) {
    try {
      window.lucide.createIcons({ targets: [button] });
    } catch {
      // Ignore if Lucide isn't targetable directly
    }
  }
}

/**
 * Wraps an async request function with button loading states and prevents duplicate clicks.
 * Guarantees button state restoration in a finally block even if an exception occurs.
 *
 * @param {HTMLButtonElement|null} button - Target button element
 * @param {string} loadingText - Text to display while loading
 * @param {Function} asyncFn - Async request function to execute
 * @returns {Promise<any>} Result of asyncFn
 */
export async function withButtonLoading(button, loadingText, asyncFn) {
  if (button && (button.disabled || loadingStateMap.has(button))) {
    return; // Prevent duplicate clicks
  }

  let applied = false;
  if (button) {
    applied = showButtonLoading(button, loadingText);
  }

  try {
    return await asyncFn();
  } finally {
    if (button && applied) {
      hideButtonLoading(button);
    }
  }
}

function escapeHtml(str) {
  if (!str) return "";
  const el = document.createElement("span");
  el.textContent = str;
  return el.innerHTML;
}
