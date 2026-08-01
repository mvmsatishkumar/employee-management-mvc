import { loadSummaryPage } from "../components/summaryPageHandler.js";

export async function loadDesignations() {
  await loadSummaryPage("designation", "Designation");
}
