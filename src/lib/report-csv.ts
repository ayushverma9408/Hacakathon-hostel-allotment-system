export function escapeSpreadsheetCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  // Neutralize spreadsheet formulas, including cells with leading whitespace.
  const normalized = text.replace(/^\uFEFF/, "");
  const safe = /^[\s]*[=+\-@\t\r]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function toCsv(rows: unknown[][]): string {
  return "\uFEFF" + rows.map((row) => row.map(escapeSpreadsheetCell).join(",")).join("\r\n") + "\r\n";
}
