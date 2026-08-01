/**
 * Animates a numeric counter on an HTML element from startValue to endValue.
 *
 * @param {HTMLElement} element - The target DOM element.
 * @param {number} endValue - Target end value.
 * @param {number} [startValue=0] - Starting value.
 * @param {number} [duration=800] - Animation duration in ms.
 * @param {function} [formatter=null] - Optional formatting function (e.g. formatCurrency).
 */
export function animateCounter(element, endValue, startValue = 0, duration = 800, formatter = null) {
  if (!element) return;

  const target = Number(endValue) || 0;
  const start = Number(startValue) || 0;

  if (duration <= 0 || target === start) {
    element.textContent = formatter ? formatter(target) : target.toLocaleString();
    return;
  }

  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic formula for smooth deceleration
    const easeOutProgress = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(start + (target - start) * easeOutProgress);

    element.textContent = formatter ? formatter(currentValue) : currentValue.toLocaleString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatter ? formatter(target) : target.toLocaleString();
    }
  }

  requestAnimationFrame(update);
}
