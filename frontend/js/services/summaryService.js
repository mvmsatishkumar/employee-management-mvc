import { apiRequest } from "./apiClient.js";

const summaryCache = new Map();

export async function getSummary(field, forceRefresh = false) {
  if (!forceRefresh && summaryCache.has(field)) {
    return summaryCache.get(field);
  }
  const data = await apiRequest(`/summary/${field}`);
  summaryCache.set(field, data);
  return data;
}

export function clearSummaryCache() {
  summaryCache.clear();
}

window.addEventListener("employee-updated", () => {
  clearSummaryCache();
});
