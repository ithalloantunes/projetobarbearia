import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import nodemailer from "nodemailer";
import type { Appointment, Barber, Service, User } from "@prisma/client";
import { minutesToTime, timeToMinutes } from "./time";

const hasEmailConfig = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);

const hasWhatsAppConfig = () =>
  Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

const isWhatsAppTestMode = () => process.env.WHATSAPP_TEST_MODE === "true";

async function writeWhatsAppTestLog(params: { to: string; message: string }) {
  const logDir = join(process.cwd(), ".tmp");
  const logPath = join(logDir, "whatsapp-mock.log");
  await mkdir(logDir, { recursive: true });
  const line = `[${new Date().toISOString()}] to=${params.to} message="${params.message.replace(/\s+/g, " ").trim()}"\n`;
  await appendFile(logPath, line, "utf8");
}

export async function sendEmail(params: { to: string; subject: string; html: string; text: string }) {
  if (!hasEmailConfig()) {
    console.warn("SMTP nao configurado. Email nao enviado.");
    return;
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: smtpUser && smtpPass ? { user: smtpUser, pass: smtpPass } : undefined
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: params.to,
    subject: params.subject,
    text: params.text,
    html: params.html
  });
}

export async function sendWhatsAppMessage(params: { to: string; message: string }) {
  if (!hasWhatsAppConfig()) {
    if (isWhatsAppTestMode()) {
      await writeWhatsAppTestLog(params);
      console.info("WhatsApp em modo de teste. Mensagem registrada em .tmp/whatsapp-mock.log");
      return;
    }

    console.warn("WhatsApp API nao configurada. Mensagem nao enviada.");
    return;
  }

  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: params.to,
      type: "text",
      text: {
        body: params.message
      }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Erro ao enviar WhatsApp", response.status, body);
  }
}

export async function sendAppointmentNotifications(params: {
  appointment: Appointment;
  client: User;
  barber: Barber;
  service: Service;
  mode?: "created" | "rescheduled";
}) {
  const { appointment, client, barber, service, mode = "created" } = params;
  const date = appointment.date.toLocaleDateString("pt-BR");
  const time = minutesToTime(timeToMinutes(appointment.startTime));
  const price = Number(appointment.price).toFixed(2).replace(".", ",");

  const subject = mode === "rescheduled" ? "Agendamento remarcado" : "Confirmacao de agendamento";
  const actionText = mode === "rescheduled" ? "foi remarcado" : "foi confirmado";
  const text = `Ola ${client.name}, seu agendamento ${actionText}.\n\nServico: ${service.name}\nBarbeiro: ${barber.name}\nData: ${date}\nHorario: ${time}\nValor: R$ ${price}`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>${subject}</h2>
      <p>Ola ${client.name}, seu agendamento ${actionText}.</p>
      <ul>
        <li><strong>Servico:</strong> ${service.name}</li>
        <li><strong>Barbeiro:</strong> ${barber.name}</li>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Horario:</strong> ${time}</li>
        <li><strong>Valor:</strong> R$ ${price}</li>
      </ul>
    </div>
  `;

  if (client.email) {
    await sendEmail({ to: client.email, subject, text, html });
  }

  if (client.phone) {
    await sendWhatsAppMessage({
      to: client.phone,
      message: `${mode === "rescheduled" ? "Agendamento remarcado!" : "Agendamento confirmado!"}\n${service.name} com ${barber.name}\n${date} as ${time}\nValor: R$ ${price}`
    });
  }
}

export async function sendAppointmentCanceledNotification(params: {
  appointment: Appointment;
  client: User;
  barber: Barber;
  service: Service;
}) {
  const { appointment, client, barber, service } = params;
  const date = appointment.date.toLocaleDateString("pt-BR");
  const time = minutesToTime(timeToMinutes(appointment.startTime));

  const subject = "Agendamento cancelado";
  const text = `Ola ${client.name}, seu agendamento foi cancelado.\n\nServico: ${service.name}\nBarbeiro: ${barber.name}\nData: ${date}\nHorario: ${time}`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Agendamento cancelado</h2>
      <p>Ola ${client.name}, seu agendamento foi cancelado.</p>
      <ul>
        <li><strong>Servico:</strong> ${service.name}</li>
        <li><strong>Barbeiro:</strong> ${barber.name}</li>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Horario:</strong> ${time}</li>
      </ul>
    </div>
  `;

  if (client.email) {
    await sendEmail({ to: client.email, subject, text, html });
  }

  if (client.phone) {
    await sendWhatsAppMessage({
      to: client.phone,
      message: `Seu agendamento foi cancelado.\n${service.name} com ${barber.name}\n${date} as ${time}`
    });
  }
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetLink: string;
}) {
  const { to, name, resetLink } = params;
  const subject = "Redefinicao de senha - BarberSaaS";
  const text = `Ola ${name}, recebemos um pedido para redefinir sua senha.\n\nUse este link: ${resetLink}\n\nSe voce nao fez este pedido, ignore este email.`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Redefinicao de senha</h2>
      <p>Ola ${name}, recebemos um pedido para redefinir sua senha.</p>
      <p>
        <a href="${resetLink}" style="background:#c59f59;color:#1a1814;padding:10px 14px;border-radius:8px;text-decoration:none;font-weight:700;">
          Definir nova senha
        </a>
      </p>
      <p style="font-size:12px;color:#666;">Se voce nao fez este pedido, ignore este email.</p>
    </div>
  `;

  await sendEmail({ to, subject, text, html });
}
