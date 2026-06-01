import { expect, test } from "@playwright/test";

const clientEmail = process.env.SMOKE_CLIENT_EMAIL || "cliente@barbersaas.com";
const clientPassword =
  process.env.SMOKE_CLIENT_PASSWORD ||
  process.env.SEED_DEFAULT_PASSWORD ||
  "Dev#Barber123!";

test("authenticated client flow: create, reschedule and cancel appointment", async ({
  page
}) => {
  await page.goto("/entrar");
  await page.getByLabel(/E-mail/i).fill(clientEmail);
  await page.getByLabel(/Senha/i).fill(clientPassword);
  await page.getByRole("button", { name: /Entrar agora/i }).click();

  await expect(page).toHaveURL(/\/agendar|\/cliente/);
  await page.goto("/agendar");
  await page.getByRole("button", { name: /Proxima etapa/i }).click();
  await page.getByRole("button", { name: /Proxima etapa/i }).click();

  const dateButtons = page.getByRole("button").filter({ hasText: /,\s/ });
  const timeButtons = page.getByRole("button").filter({ hasText: /^\d{2}:\d{2}$/ });
  let slotFound = false;

  const dateCount = await dateButtons.count();
  for (let i = 0; i < dateCount; i += 1) {
    await dateButtons.nth(i).click();
    await page.waitForTimeout(250);
    if ((await timeButtons.count()) > 0) {
      await timeButtons.first().click();
      slotFound = true;
      break;
    }
  }

  expect(slotFound).toBe(true);

  await page.getByRole("button", { name: /Proxima etapa/i }).click();
  await page.getByRole("button", { name: /Confirmar agendamento/i }).click();
  await expect(page.getByRole("heading", { name: /Reserva confirmada/i })).toBeVisible();

  const listPayload = (await page.evaluate(async () => {
    const response = await fetch("/api/client/appointments");
    const data = await response.json();
    return { status: response.status, data };
  })) as {
    status: number;
    data: {
      appointments: Array<{ id: number; status: string }>;
    };
  };

  expect(listPayload.status).toBe(200);
  const activeAppointment = listPayload.data.appointments
    .filter((item) => item.status === "PENDING" || item.status === "CONFIRMED")
    .sort((a, b) => b.id - a.id)[0];
  const appointmentId = activeAppointment?.id;
  expect(appointmentId).toBeTruthy();

  await page.goto(`/cliente/agendamentos/${appointmentId}`);
  await expect(
    page.getByRole("heading", { name: new RegExp(`Agendamento #${appointmentId}`) })
  ).toBeVisible();

  await page.getByRole("button", { name: /Confirmar remarcacao/i }).click();
  await expect(page.getByText(/Agendamento remarcado com sucesso/i)).toBeVisible();

  await page.getByRole("button", { name: /Cancelar agendamento/i }).click();
  await page.getByRole("button", { name: /Sim, cancelar/i }).click();
  await expect(page.getByText(/Agendamento cancelado com sucesso/i)).toBeVisible();

  const finalPayload = (await page.evaluate(async (id) => {
    const response = await fetch(`/api/appointments/${id}`);
    const data = await response.json();
    return { status: response.status, data };
  }, appointmentId)) as {
    status: number;
    data: {
      appointment: { status: string };
    };
  };
  expect(finalPayload.status).toBe(200);
  expect(finalPayload.data.appointment.status).toBe("CANCELED");
});
