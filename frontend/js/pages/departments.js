import { loadSummaryPage } from "../components/summaryPageHandler.js";

export async function loadDepartments() {
  await loadSummaryPage("department", "Department");
}
