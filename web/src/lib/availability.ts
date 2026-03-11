import { AppointmentStatus, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import {
  buildTimeDate,
  isToday,
  minutesToTime,
  parseTimeToMinutes,
  timeToMinutes
} from "./time";

type PrismaExecutor = Prisma.TransactionClient | PrismaClient;

const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW"
];

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && endA > startB;
}

export async function getAvailableSlots(params: {
  barberId: number;
  serviceId: number;
  date: string;
  stepMinutes?: number;
}, prismaClient: PrismaExecutor = prisma) {
  const { barberId, serviceId, date, stepMinutes = 15 } = params;
  const targetDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(targetDate.getTime())) {
    throw new Error("Data inv?lida.");
  }

  const service = await prismaClient.service.findUnique({ where: { id: serviceId } });
  if (!service) {
    throw new Error("Servi?o n?o encontrado.");
  }

  const dayOfWeek = targetDate.getDay();

  const [availability, blocks, appointments] = await Promise.all([
    prismaClient.availability.findMany({
      where: {
        barberId,
        dayOfWeek
      },
      orderBy: { startTime: "asc" }
    }),
    prismaClient.block.findMany({
      where: {
        barberId,
        date: targetDate
      }
    }),
    prismaClient.appointment.findMany({
      where: {
        barberId,
        date: targetDate,
        status: { in: ACTIVE_APPOINTMENT_STATUSES }
      }
    })
  ]);

  const blockedIntervals = [
    ...blocks.map((block) => ({
      start: timeToMinutes(block.startTime),
      end: timeToMinutes(block.endTime)
    })),
    ...appointments.map((appointment) => ({
      start: timeToMinutes(appointment.startTime),
      end: timeToMinutes(appointment.endTime)
    }))
  ];

  const duration = service.durationMinutes;
  const slots: string[] = [];

  const now = new Date();
  const minTodayMinutes = isToday(targetDate)
    ? Math.ceil((now.getHours() * 60 + now.getMinutes()) / stepMinutes) * stepMinutes
    : null;

  for (const window of availability) {
    const startWindow = timeToMinutes(window.startTime);
    const endWindow = timeToMinutes(window.endTime);

    for (let start = startWindow; start + duration <= endWindow; start += stepMinutes) {
      if (minTodayMinutes !== null && start < minTodayMinutes) {
        continue;
      }

      const end = start + duration;
      const conflict = blockedIntervals.some((interval) => overlaps(start, end, interval.start, interval.end));
      if (!conflict) {
        slots.push(minutesToTime(start));
      }
    }
  }

  return {
    date,
    barberId,
    serviceId,
    duration,
    slots
  };
}

export async function assertSlotAvailable(params: {
  barberId: number;
  serviceId: number;
  date: string;
  time: string;
}, prismaClient: PrismaExecutor = prisma) {
  const { barberId, serviceId, date, time } = params;
  const availability = await getAvailableSlots({ barberId, serviceId, date }, prismaClient);
  if (!availability.slots.includes(time)) {
    throw new Error("Hor?rio indispon?vel.");
  }

  return {
    startTime: buildTimeDate(time),
    endTime: buildTimeDate(minutesToTime(parseTimeToMinutes(time) + availability.duration))
  };
}
