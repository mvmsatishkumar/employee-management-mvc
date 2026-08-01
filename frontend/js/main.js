import { initialiseRouter } from "./router.js";

document.addEventListener("DOMContentLoaded", () => {
  try {
    initialiseRouter();
  } catch (error) {
    console.error("Failed to initialize router:", error);
    throw error;
  }
});
