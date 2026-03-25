import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  "/",
  "/entrar",
  "/cadastrar",
  "/termos-de-uso",
  "/politica-privacidade"
];

for (const route of routes) {
  test(`a11y critical violations on ${route}`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page }).analyze();
    const criticalViolations = results.violations.filter(
      (violation) => violation.impact === "critical"
    );

    expect(
      criticalViolations,
      `Violacoes criticas encontradas em ${route}: ${criticalViolations
        .map((violation) => violation.id)
        .join(", ")}`
    ).toEqual([]);
  });
}
