import test from "node:test";
import assert from "node:assert/strict";
import { planAllocation } from "../src/lib/allocation-engine";

const rooms = [
  { id: "r2", code: "A-102", capacity: 1, buildingCode: "A", buildingName: "Block A", hostelCode: "H1", hostelName: "Hostel One" },
  { id: "r1", code: "A-101", capacity: 2, buildingCode: "A", buildingName: "Block A", hostelCode: "H1", hostelName: "Hostel One" }
];
const people = [
  { id: "p3", registrationNo: "REG-003", fullName: "Third", createdAt: "2026-01-03T00:00:00Z" },
  { id: "p1", registrationNo: "REG-001", fullName: "First", createdAt: "2026-01-01T00:00:00Z" },
  { id: "p2", registrationNo: "REG-002", fullName: "Second", createdAt: "2026-01-02T00:00:00Z" },
  { id: "p4", registrationNo: "REG-004", fullName: "Fourth", createdAt: "2026-01-04T00:00:00Z" }
];

test("allocates oldest registrations first into stable room/bed order", () => {
  const plan = planAllocation(people, rooms);
  assert.deepEqual(plan.assignments.map((item) => item.participantId), ["p1", "p2", "p3"]);
  assert.deepEqual(plan.assignments.map((item) => [item.roomId, item.bedNumber]), [["r1", 1], ["r1", 2], ["r2", 1]]);
  assert.equal(plan.waitlist[0].participantId, "p4");
});

test("reports capacity and utilization accurately", () => {
  const plan = planAllocation(people, rooms);
  assert.deepEqual(plan.statistics, { participants: 4, rooms: 2, bedCapacity: 3, assigned: 3, waitlisted: 1, unfilledBeds: 0, occupancyPercent: 100 });
});

test("waitlists everyone when there are no active rooms", () => {
  const plan = planAllocation(people, []);
  assert.equal(plan.assignments.length, 0);
  assert.equal(plan.waitlist.length, 4);
  assert.deepEqual(plan.waitlist.map((item) => item.position), [1, 2, 3, 4]);
});

test("supports no participants without producing NaN metrics", () => {
  const plan = planAllocation([], rooms);
  assert.equal(plan.statistics.occupancyPercent, 0);
  assert.equal(plan.statistics.unfilledBeds, 3);
});

test("rejects invalid capacities and duplicate room IDs", () => {
  assert.throws(() => planAllocation([], [{ ...rooms[0], capacity: 0 }]), /invalid capacity/i);
  assert.throws(() => planAllocation([], [rooms[0], rooms[0]]), /duplicate room/i);
});

test("rejects duplicate participants and invalid timestamps", () => {
  assert.throws(() => planAllocation([people[0], people[0]], rooms), /duplicate participant/i);
  assert.throws(() => planAllocation([{ ...people[0], createdAt: "not-a-date" }], rooms), /invalid registration timestamp/i);
});
