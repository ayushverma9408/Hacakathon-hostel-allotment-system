import { expect, test, type Page } from "@playwright/test";

const password = "E2E-Test-Password-2026!";

async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in to workspace" }).click();
  await expect(page).toHaveURL("/");
}

test.describe.serial("AllotmentPro role and operational journeys", () => {
  test("Warden can preview allocations but cannot commit or view administrator audit", async ({ page }) => {
    await signIn(page, "e2e-warden@example.test");

    await page.goto("/admin/hostels");
    await expect(page.getByRole("heading", { name: "Add hostel" })).toBeVisible();

    await page.goto("/admin/allocations");
    await page.getByRole("button", { name: "Generate preview" }).click();
    await expect(page.getByRole("heading", { name: "Preview results" })).toBeVisible();
    await expect(page.getByText("Read-only: administrator approval required to commit.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Commit allocation" })).toHaveCount(0);

    await page.goto("/admin/audit");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Audit trail" })).toHaveCount(0);
  });

  test("Staff remains read-only and cannot export participant-level reports", async ({ page }) => {
    await signIn(page, "e2e-staff@example.test");

    await page.goto("/admin/hostels");
    await expect(page.getByRole("heading", { name: "Hostels & rooms" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Add hostel" })).toHaveCount(0);

    await page.goto("/admin/participants");
    await expect(page.getByRole("heading", { name: "Participants" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Register participant" })).toHaveCount(0);

    await page.goto("/admin/reports");
    await expect(page.getByRole("heading", { name: "Reports & analytics" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Download .* CSV/ })).toHaveCount(0);

    const usersResponse = await page.request.get("/api/admin/users");
    expect(usersResponse.status()).toBe(403);

    await page.goto("/admin/audit");
    await expect(page).toHaveURL("/");
  });

  test("Administrator completes hostel, participant, allocation, report and audit workflow", async ({ page }) => {
    const suffix = Date.now().toString().slice(-6);
    const hostelCode = `E2E-${suffix}`;
    const hostelName = `E2E Hostel ${suffix}`;
    const buildingCode = `BLK-${suffix}`;
    const buildingName = `E2E Block ${suffix}`;
    const roomCode = `R-${suffix}`;
    const registrationNo = `E2E-${suffix}`;
    const participantName = `E2E Participant ${suffix}`;

    await signIn(page, "e2e-admin@example.test");
    await expect(page.getByRole("heading", { name: "Hostel operations" })).toBeVisible();

    await page.goto("/admin/hostels");
    await page.getByPlaceholder("Hostel code").fill(hostelCode);
    await page.getByPlaceholder("Hostel name").fill(hostelName);
    await page.getByRole("button", { name: "Create hostel" }).click();
    await expect(page.getByRole("heading", { name: hostelName })).toBeVisible();

    const hostelSelect = page.locator("form").nth(1).locator("select");
    await hostelSelect.selectOption({ label: hostelName });
    await page.getByPlaceholder("Building code").fill(buildingCode);
    await page.getByPlaceholder("Building name").fill(buildingName);
    await page.getByRole("button", { name: "Create building" }).click();
    await expect(page.locator("form").nth(2).locator("select").locator("option", { hasText: buildingName })).toHaveCount(1);

    const roomSelect = page.locator("form").nth(2).locator("select");
    await roomSelect.selectOption({ label: `${hostelCode} / ${buildingName}` });
    await page.getByPlaceholder("Room code").fill(roomCode);
    await page.locator("form").nth(2).locator('input[type="number"]').nth(1).fill("1");
    await page.getByRole("button", { name: "Create room" }).click();
    await expect(page.getByText(new RegExp(`${roomCode} · 1 beds`))).toBeVisible();

    await page.goto("/admin/participants");
    await page.getByPlaceholder("Registration number").fill(registrationNo);
    await page.getByPlaceholder("Full name").fill(participantName);
    await page.getByPlaceholder("Email (optional)").fill(`participant-${suffix}@example.test`);
    await page.getByPlaceholder("Department").fill("Computer Science");
    await page.getByRole("button", { name: "Register participant" }).click();
    await expect(page.getByText(registrationNo)).toBeVisible();
    await expect(page.getByText(participantName)).toBeVisible();

    await page.goto("/admin/allocations");
    await page.getByRole("button", { name: "Generate preview" }).click();
    await expect(page.getByRole("heading", { name: "Preview results" })).toBeVisible();
    await expect(page.getByText(registrationNo)).toBeVisible();

    page.on("dialog", async (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Commit allocation" }).click();
    await expect(page.getByRole("status")).toContainText("Allocation run");
    await expect(page.getByText("COMPLETED").first()).toBeVisible();

    await page.goto("/admin/reports");
    await expect(page.getByRole("heading", { name: "Reports & analytics" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Hostel occupancy" })).toBeVisible();
    await expect(page.getByText(hostelName, { exact: true })).toBeVisible();
    const csvHref = await page.getByRole("link", { name: "Download allocation CSV" }).getAttribute("href");
    expect(csvHref).toBeTruthy();
    const csvResponse = await page.request.get(csvHref!);
    expect(csvResponse.ok()).toBeTruthy();
    expect(csvResponse.headers()["content-type"]).toContain("text/csv");
    expect(await csvResponse.text()).toContain(registrationNo);

    await page.goto("/admin/audit");
    await expect(page.getByRole("heading", { name: "Audit trail" })).toBeVisible();
    await expect(page.getByText("HOSTEL_CREATED").first()).toBeVisible();
    await expect(page.getByText("PARTICIPANT_CREATED").first()).toBeVisible();
    await expect(page.getByText("ALLOCATION_RUN_COMPLETED").first()).toBeVisible();
  });
});
