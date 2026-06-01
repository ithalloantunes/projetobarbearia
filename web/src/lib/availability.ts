import { AppointmentStatus, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import {
  buildTimeDate,
  isToday,
  minutesToTime,
  parseTimeToMinutes,
  timeToMinutes
} from "./time";

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

const ACTIVE_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "NO_SHOW"
];

function overlaps(startA: number, endA: number, startB: number, endB: number) {
  return startA < endB && endA > startB;
}

async function getAvailableSlotsByDuration(
  params: {
    barberId: number;
    date: string;
    duration: number;
    stepMinutes?: number;
    excludeAppointmentId?: number;
  },
  prismaClient: PrismaExecutor = prisma
) {
  const { barberId, date, duration, stepMinutes = 15, excludeAppointmentId } = params;
  const targetDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(targetDate.getTime())) {
    throw new Error("Data invalida.");
  }
  if (!Number.isInteger(duration) || duration <= 0) {
    throw new Error("Duracao invalida.");
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
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
        ...(excludeAppointmentId ? { id: { not: excludeAppointmentId } } : {})
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
    duration,
    slots
  };
}

function uniquePositiveInt(values: number[]) {
  const seen = new Set<number>();
  const list: number[] = [];
  for (const value of values) {
    if (!Number.isInteger(value) || value <= 0) {
      continue;
    }
    if (!seen.has(value)) {
      seen.add(value);
      list.push(value);
    }
  }
  return list;
}

export async function getAvailableSlotsForServices(
  params: {
    barberId: number;
    serviceIds: number[];
    date: string;
    stepMinutes?: number;
    excludeAppointmentId?: number;
  },
  prismaClient: PrismaExecutor = prisma
) {
  const { barberId, serviceIds, date, stepMinutes = 15, excludeAppointmentId } = params;
  const normalizedServiceIds = uniquePositiveInt(serviceIds);
  if (normalizedServiceIds.length === 0) {
    throw new Error("Servico nao encontrado.");
  }

  const services = await prismaClient.service.findMany({
    where: {
      id: { in: normalizedServiceIds }
    },
    select: {
      id: true,
      durationMinutes: true
    }
  });

  if (services.length !== normalizedServiceIds.length) {
    throw new Error("Servico nao encontrado.");
  }

  const totalDuration = services.reduce((sum, service) => sum + service.durationMinutes, 0);
  const slots = await getAvailableSlotsByDuration(
    {
      barberId,
      date,
      duration: totalDuration,
      stepMinutes,
      excludeAppointmentId
    },
    prismaClient
  );

  return {
    ...slots,
    serviceIds: normalizedServiceIds
  };
}

export async function getAvailableSlots(
  params: {
    barberId: number;
    serviceId: number;
    date: string;
    stepMinutes?: number;
    excludeAppointmentId?: number;
  },
  prismaClient: PrismaExecutor = prisma
) {
  const { barberId, serviceId, date, stepMinutes = 15, excludeAppointmentId } = params;
  const slots = await getAvailableSlotsForServices(
    {
      barberId,
      serviceIds: [serviceId],
      date,
      stepMinutes,
      excludeAppointmentId
    },
    prismaClient
  );

  return {
    ...slots,
    serviceId
  };
}

export async function assertSlotAvailableForServices(
  params: {
    barberId: number;
    serviceIds: number[];
    date: string;
    time: string;
    excludeAppointmentId?: number;
  },
  prismaClient: PrismaExecutor = prisma
) {
  const { barberId, serviceIds, date, time, excludeAppointmentId } = params;
  const availability = await getAvailableSlotsForServices(
    { barberId, serviceIds, date, excludeAppointmentId },
    prismaClient
  );

  if (!availability.slots.includes(time)) {
    throw new Error("Horario indisponivel.");
  }

  return {
    startTime: buildTimeDate(time),
    endTime: buildTimeDate(minutesToTime(parseTimeToMinutes(time) + availability.duration)),
    duration: availability.duration
  };
}

export async function assertSlotAvailable(
  params: {
    barberId: number;
    serviceId: number;
    date: string;
    time: string;
    excludeAppointmentId?: number;
  },
  prismaClient: PrismaExecutor = prisma
) {
  const { barberId, serviceId, date, time, excludeAppointmentId } = params;
  return assertSlotAvailableForServices(
    { barberId, serviceIds: [serviceId], date, time, excludeAppointmentId },
    prismaClient
  );
}
