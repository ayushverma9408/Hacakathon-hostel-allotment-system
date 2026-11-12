import test from "node:test";
import assert from "node:assert/strict";
import { hasPermission } from "../src/lib/permissions";
import { credentialsSchema } from "../src/lib/validation/auth";
import { getSecurityHeaders } from "../src/lib/security-headers";

test("administrator has every administrative permission", () => {
  for (const permission of [
    "users:read", "hostels:read", "hostels:manage",
    "participants:read", "participants:manage",
    "allocations:read", "allocations:manage",
    "reports:read", "reports:export", "audit:read"
  ] as const) {
    assert.equal(hasPermission("ADMIN", permission), true, permission);
  }
});

test("warden can manage hostels and participants but cannot administer users, allocations or audit", () => {
  assert.equal(hasPermission("WARDEN", "hostels:manage"), true);
  assert.equal(hasPermission("WARDEN", "participants:manage"), true);
  assert.equal(hasPermission("WARDEN", "users:read"), false);
  assert.equal(hasPermission("WARDEN", "allocations:manage"), false);
  assert.equal(hasPermission("WARDEN", "audit:read"), false);
});

test("staff has read-only operational and aggregate-report access", () => {
  for (const permission of ["hostels:read", "participants:read", "allocations:read", "reports:read"] as const) {
    assert.equal(hasPermission("STAFF", permission), true, permission);
  }
  for (const permission of ["users:read", "hostels:manage", "participants:manage", "allocations:manage", "reports:export", "audit:read"] as const) {
    assert.equal(hasPermission("STAFF", permission), false, permission);
  }
});

test("credentials reject short passwords, oversized UTF-8 passwords and malformed emails", () => {
  assert.equal(credentialsSchema.safeParse({ email: "a@example.test", password: "short" }).success, false);
  assert.equal(credentialsSchema.safeParse({ email: "a@example.test", password: "é".repeat(37) }).success, false);
  assert.equal(credentialsSchema.safeParse({ email: "not-an-email", password: "a-secure-password-123" }).success, false);
});

test("credentials accept a valid email and a 72-byte password", () => {
  assert.equal(credentialsSchema.safeParse({ email: "admin@example.test", password: "a-secure-password-123" }).success, true);
});

test("security headers include browser protections and production-only HSTS", () => {
  const development = getSecurityHeaders(false);
  const production = getSecurityHeaders(true);
  assert.ok(development.some((header) => header.key === "X-Frame-Options" && header.value === "DENY"));
  assert.ok(development.some((header) => header.key === "X-Content-Type-Options" && header.value === "nosniff"));
  assert.equal(development.some((header) => header.key === "Strict-Transport-Security"), false);
  assert.ok(production.some((header) => header.key === "Strict-Transport-Security"));
});
