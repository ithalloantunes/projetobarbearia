export function timeToMinutes(time: Date): number {
  return time.getUTCHours() * 60 + time.getUTCMinutes();
}

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map((value) => Number(value));
  return hours * 60 + (minutes || 0);
}

export function minutesToTime(minutes: number): string {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function buildTimeDate(time: string): Date {
  const clean = time.length === 5 ? `${time}:00` : time;
  return new Date(`1970-01-01T${clean}`);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return toDateKey(now) === toDateKey(date);
}
