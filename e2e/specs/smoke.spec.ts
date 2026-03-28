/// <reference types="node" />
import { test, expect } from "@playwright/test";

test.describe("Smoke", () => {
  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ShopSmart|Next/);
  });

  test("API health responds", async ({ request }) => {
    const baseURL = process.env.API_URL || "http://localhost:4000";
    const res = await request.get(`${baseURL}/api/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toMatchObject({ success: true, message: "ShopSmart API" });
  });
});
