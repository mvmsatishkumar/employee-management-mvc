import { API_BASE_URL } from "../config.js";

export class ApiError extends Error {
  constructor(message, { status = 0, validationErrors = {} } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await readResponse(response);

  if (!response.ok) {
    const validationErrors = normalizeValidationErrors(
      payload?.validationErrors ?? payload?.errors,
    );
    throw new ApiError(getErrorMessage(payload, response.status), {
      status: response.status,
      validationErrors,
    });
  }

  return payload;
}

async function readResponse(response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload, status) {
  if (Array.isArray(payload?.errors) && payload.errors.length) {
    return payload.errors.join(" ");
  }

  if (payload?.message) {
    return payload.message;
  }

  if (status === 404) {
    return "The requested employee could not be found.";
  }

  if (status === 409) {
    return "This employee record conflicts with an existing item.";
  }

  return "The request could not be completed. Please try again.";
}

function normalizeValidationErrors(input) {
  if (!input) return {};
  if (typeof input === "object" && !Array.isArray(input)) {
    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[key] = Array.isArray(value) ? value : [value];
      return acc;
    }, {});
  }
  return {};
}
