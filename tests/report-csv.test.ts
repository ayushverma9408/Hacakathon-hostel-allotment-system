import test from "node:test";
import assert from "node:assert/strict";
import { escapeSpreadsheetCell, toCsv } from "../src/lib/report-csv";

test("CSV cells are quoted and embedded quotes are escaped", () => {
  assert.equal(escapeSpreadsheetCell('Verma, "Ayush"'), '"Verma, ""Ayush"""');
});

test("spreadsheet formulas are neutralized", () => {
  assert.equal(escapeSpreadsheetCell("=1+1"), '"\'=1+1"');
  assert.equal(escapeSpreadsheetCell("  @SUM(A1:A2)"), '"\'  @SUM(A1:A2)"');
  assert.equal(escapeSpreadsheetCell("-10"), '"\'-10"');
});

test("CSV output includes UTF-8 BOM and CRLF records", () => {
  assert.equal(toCsv([["Name", "Value"], ["A", 2]]), '\uFEFF"Name","Value"\r\n"A","2"\r\n');
});
