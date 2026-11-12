import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "../src/lib/csv";

test("parses commas inside quoted fields", () => {
  assert.deepEqual(parseCsv('registrationNo,fullName\nR1,"Verma, Ayush"'), [["registrationNo", "fullName"], ["R1", "Verma, Ayush"]]);
});

test("supports escaped quotes and multiline fields", () => {
  assert.deepEqual(parseCsv('registrationNo,fullName\r\nR1,"Ayush ""AV"", Verma"\r\nR2,"Second\nParticipant"'), [["registrationNo", "fullName"], ["R1", 'Ayush "AV", Verma'], ["R2", "Second\nParticipant"]]);
});

test("removes UTF-8 BOM and ignores blank lines", () => {
  assert.deepEqual(parseCsv('\uFEFFregistrationNo,fullName\n\nR1,Sample\n'), [["registrationNo", "fullName"], ["R1", "Sample"]]);
});

test("rejects unclosed quoted fields", () => {
  assert.throws(() => parseCsv('registrationNo,fullName\nR1,"Unclosed'), /unclosed quoted field/i);
});
