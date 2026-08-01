export function renderTableSkeletons(columnCount = 6, rowCount = 5) {
  const cols = Array.from({ length: columnCount })
    .map(() => `<td><div class="skeleton-cell"></div></td>`)
    .join("");

  return Array.from({ length: rowCount })
    .map(() => `<tr class="skeleton-row">${cols}</tr>`)
    .join("");
}

export function renderCardSkeleton() {
  return `<div class="skeleton-card"></div>`;
}
