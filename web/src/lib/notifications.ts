import nodemailer from "nodemailer";
import type { Appointment, Barber, Service, User } from "@prisma/client";
import { minutesToTime, timeToMinutes } from "./time";

const hasEmailConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM);

const hasWhatsAppConfig = () =>
  Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

export async function sendEmail(params: { to: string; subject: string; html: string; text: string }) {
  if (!hasEmailConfig()) {
    console.warn("SMTP não configurado. Email não enviado.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
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
    console.warn("WhatsApp API não configurada. Mensagem não enviada.");
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
}) {
  const { appointment, client, barber, service } = params;
  const date = appointment.date.toLocaleDateString("pt-BR");
  const time = minutesToTime(timeToMinutes(appointment.startTime));
  const price = Number(appointment.price).toFixed(2).replace(".", ",");

  const subject = "Confirmação de agendamento";
  const text = `Olá ${client.name}, seu agendamento foi confirmado.\n\nServiço: ${service.name}\nBarbeiro: ${barber.name}\nData: ${date}\nHorário: ${time}\nValor: R$ ${price}`;
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2>Confirmação de agendamento</h2>
      <p>Olá ${client.name}, seu agendamento foi confirmado.</p>
      <ul>
        <li><strong>Serviço:</strong> ${service.name}</li>
        <li><strong>Barbeiro:</strong> ${barber.name}</li>
        <li><strong>Data:</strong> ${date}</li>
        <li><strong>Horário:</strong> ${time}</li>
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
      message: `Agendamento confirmado!\n${service.name} com ${barber.name}\n${date} às ${time}\nValor: R$ ${price}`
    });
  }
}
