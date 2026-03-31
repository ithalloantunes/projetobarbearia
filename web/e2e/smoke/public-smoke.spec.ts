import { expect, test } from "@playwright/test";

test.describe("public browser smoke", () => {
  test("home page renders with primary CTA", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /Experiencia de barbearia premium com agendamento em segundos/i
      })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Agendar agora/i })).toBeVisible();
  });

  test("login page renders essential controls", async ({ page }) => {
    await page.goto("/entrar");

    await expect(page.getByRole("heading", { name: /^Entrar$/i })).toBeVisible();
    await expect(page.getByLabel(/E-mail/i)).toBeVisible();
    await expect(page.getByLabel(/Senha/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /Entrar agora/i })).toBeVisible();
  });

  test("register page renders required fields", async ({ page }) => {
    await page.goto("/cadastrar");

    await expect(page.getByRole("heading", { name: /Criar conta/i })).toBeVisible();
    await expect(page.getByLabel(/Nome completo/i)).toBeVisible();
    await expect(page.getByLabel(/Confirmar senha/i)).toBeVisible();
    await expect(page.getByRole("checkbox")).toBeVisible();
  });

  test("booking page redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/agendar");

    await expect(page).toHaveURL(/\/entrar\?next=%2Fagendar$/i);
    await expect(page.getByRole("button", { name: /Entrar agora/i })).toBeVisible();
  });
});
