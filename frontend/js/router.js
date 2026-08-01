import { loadSearch } from "./pages/search.js";
import { loadEmployeesPage } from "./pages/employees.js";
import { loadDepartments } from "./pages/departments.js";
import { loadDesignations } from "./pages/designations.js";
import { loadDashboard } from "./pages/dashboard.js";

const pageInitialisers = {
  search: loadSearch,
  employees: loadEmployeesPage,
  departments: loadDepartments,
  designations: loadDesignations,
  dashboard: loadDashboard,
};

const pageTitles = {
  dashboard: "Dashboard — Employee Management Platform",
  employees: "Employees — Employee Management Platform",
  search: "Search — Employee Management Platform",
  departments: "Departments — Employee Management Platform",
  designations: "Designations — Employee Management Platform",
};

export function initialiseRouter() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.onclick = (event) => {
      event.preventDefault();
      const targetPage = item.dataset.page;
      if (targetPage) {
        window.location.hash = targetPage;
      }
    };
  });

  if (!window.__routerPopstateBound) {
    window.addEventListener("popstate", () => {
      const pageFromHash = window.location.hash.replace("#", "") || "dashboard";
      loadPage(pageFromHash, false);
    });
    window.__routerPopstateBound = true;
  }

  const initialPage = window.location.hash.replace("#", "") || "dashboard";
  loadPage(initialPage, true);
}

export async function loadPage(page, updateHash = true) {
  const targetPage = pageInitialisers[page] ? page : "dashboard";
  const content = document.getElementById("content");
  if (!content) return;

  if (updateHash && window.location.hash !== `#${targetPage}`) {
    window.history.pushState({ page: targetPage }, "", `#${targetPage}`);
  }

  try {
    const response = await fetch(`pages/${targetPage}.html`);

    if (!response.ok) {
      throw new Error(`Unable to load the ${targetPage} page.`);
    }

    content.innerHTML = await response.text();
    setActiveNavigation(targetPage);

    if (pageTitles[targetPage]) {
      document.title = pageTitles[targetPage];
    }

    if (pageInitialisers[targetPage]) {
      await pageInitialisers[targetPage]();
    }

    try {
      window.dispatchEvent(
        new CustomEvent("page-ready", { detail: { page: targetPage } }),
      );
    } catch (e) {
      // ignore
    }

    window.lucide?.createIcons();
  } catch (error) {
    console.error(error);
    content.innerHTML = `
      <section class="page-state page-state--error" role="alert">
        <h2>Page unavailable</h2>
        <p>We could not load this page. Please try again.</p>
      </section>
    `;
  }
}

function setActiveNavigation(activePage) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === activePage);
  });
}
