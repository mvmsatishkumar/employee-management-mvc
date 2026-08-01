const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'.-]*$/;

export function isValidEmployeeName(name) {
  const value = String(name ?? "").trim();
  if (!value) {
    return false;
  }

  if (/\d/.test(value)) {
    return false;
  }

  return NAME_PATTERN.test(value);
}

export function getEmployeeNameError(name) {
  const value = String(name ?? "").trim();
  if (!value) {
    return "Name is required.";
  }

  if (/\d/.test(value)) {
    return "Name cannot contain numbers.";
  }

  if (!NAME_PATTERN.test(value)) {
    return "Name must contain only letters, spaces, hyphens, or apostrophes.";
  }

  return null;
}
