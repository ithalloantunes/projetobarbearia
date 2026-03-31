import { describe, expect, it, vi } from "vitest";
import { assertSlotAvailable, getAvailableSlots } from "@/lib/availability";

function utcTime(hour: number, minute: number) {
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0, 0));
}

describe("availability", () => {
  it("returns slots excluding overlaps from blocks and appointments", async () => {
    const prismaMock = {
      service: {
        findUnique: vi.fn().mockResolvedValue({ id: 1, durationMinutes: 30 })
      },
      availability: {
        findMany: vi.fn().mockResolvedValue([
          {
            startTime: utcTime(9, 0),
            endTime: utcTime(11, 0)
          }
        ])
      },
      block: {
        findMany: vi.fn().mockResolvedValue([
          {
            startTime: utcTime(9, 30),
            endTime: utcTime(10, 0)
          }
        ])
      },
      appointment: {
        findMany: vi.fn().mockResolvedValue([
          {
            startTime: utcTime(10, 0),
            endTime: utcTime(10, 30)
          }
        ])
      }
    };

    const result = await getAvailableSlots(
      {
        barberId: 1,
        serviceId: 1,
        date: "2099-01-01",
        stepMinutes: 30
      },
      prismaMock as never
    );

    expect(result.slots).toEqual(["09:00", "10:30"]);
  });

  it("asserts a slot as available and returns start/end dates", async () => {
    const prismaMock = {
      service: {
        findUnique: vi.fn().mockResolvedValue({ id: 1, durationMinutes: 45 })
      },
      availability: {
        findMany: vi.fn().mockResolvedValue([
          {
            startTime: utcTime(9, 0),
            endTime: utcTime(12, 0)
          }
        ])
      },
      block: {
        findMany: vi.fn().mockResolvedValue([])
      },
      appointment: {
        findMany: vi.fn().mockResolvedValue([])
      }
    };

    const slot = await assertSlotAvailable(
      {
        barberId: 1,
        serviceId: 1,
        date: "2099-01-01",
        time: "09:30"
      },
      prismaMock as never
    );

    expect(slot.startTime).toBeInstanceOf(Date);
    expect(slot.endTime).toBeInstanceOf(Date);
  });
});
