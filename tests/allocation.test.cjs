const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const allocationPath = path.join(
  __dirname,
  "../hostel_allotment_sys/js/allocation.js"
);
const source = fs.readFileSync(allocationPath, "utf8");
const sandbox = { module: { exports: {} }, console };
vm.runInNewContext(source, sandbox, { filename: allocationPath });

const { AllocationEngine, AllocationStrategy, AllocationUtils } =
  sandbox.module.exports;

const rooms = [
  { building: "A Block", "room number": "101", capacity: "2", gender: "Male" },
  { building: "B Block", room_number: "201", capacity: 1, gender: "F" }
];
const students = [
  { name: "Aarav", gender: "M", year: "2", department: "CSE" },
  { name: "Diya", gender: "Female", year: "1", department: "ECE" },
  { name: "Kabir", gender: "Male", year: "1", department: "CSE" },
  { name: "Mira", gender: "F", year: "3", department: "ECE" }
];

test("allocates only to rooms with matching normalized gender", () => {
  const result = new AllocationEngine(rooms, students, AllocationStrategy.FIFO).execute();
  assert.equal(result.allotted.length, 3);
  assert.equal(result.waitlist.length, 1);
  assert.ok(result.allotted.every(item => item.status === "Allotted"));
  assert.equal(result.statistics.totalParticipants, 4);
});

test("expands room capacity into individual bed slots", () => {
  const engine = new AllocationEngine(rooms, students);
  engine.initializeRoomPool();
  assert.equal(engine.roomPool.length, 3);
});

test("accepts common gender aliases", () => {
  const engine = new AllocationEngine([], []);
  assert.equal(engine.normalizeGender("boy"), "male");
  assert.equal(engine.normalizeGender("F"), "female");
  assert.equal(engine.normalizeGender("Other"), "other");
});

test("rejects a room with missing required fields", () => {
  assert.throws(() => AllocationUtils.validateHostelData([
    { building: "A", capacity: 2, gender: "Male" }
  ]), /room number is required/);
});

test("rejects zero, negative, fractional and non-numeric capacities", () => {
  for (const capacity of [0, -1, 1.5, "many"]) {
    assert.throws(() => AllocationUtils.validateHostelData([
      { building: "A", room_number: "1", capacity, gender: "Male" }
    ]), /capacity must be a positive whole number/);
  }
});

test("rejects unsupported gender values rather than silently grouping them", () => {
  assert.throws(() => AllocationUtils.validateParticipantData([
    { name: "Test Student", gender: "unknown" }
  ]), /Unsupported gender/);
});

test("rejects duplicate building and room combinations", () => {
  assert.throws(() => AllocationUtils.validateHostelData([
    { building: "A", room_number: "1", capacity: 2, gender: "Male" },
    { building: "a", room_number: "1", capacity: 1, gender: "Male" }
  ]), /duplicate room/);
});

test("allows different students with the same name", () => {
  assert.equal(AllocationUtils.validateParticipantData([
    { name: "Alex", gender: "M" },
    { name: "Alex", gender: "F" }
  ]), true);
});

test("re-running the same engine does not duplicate previous results", () => {
  const engine = new AllocationEngine(rooms, students);
  const first = engine.execute();
  const second = engine.execute();
  assert.equal(first.allotted.length, second.allotted.length);
  assert.equal(second.allotted.length + second.waitlist.length, students.length);
});
