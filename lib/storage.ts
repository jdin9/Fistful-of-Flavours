import { promises as fs } from "fs";
import path from "path";

import { getTorontoNowISOString } from "./datetime";
import type { BookingRecord } from "./validation";

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_FILE = path.join(DATA_DIR, "bookings.json");
const BOOKINGS_DIR = path.join(DATA_DIR, "bookings");

async function ensureBookingsDir() {
  await fs.mkdir(BOOKINGS_DIR, { recursive: true });
}

async function readLegacyRecords(): Promise<BookingRecord[]> {
  try {
    const raw = await fs.readFile(LEGACY_FILE, "utf-8");
    const parsed = JSON.parse(raw) as BookingRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readDirectoryRecords(): Promise<BookingRecord[]> {
  try {
    await ensureBookingsDir();
    const entries = await fs.readdir(BOOKINGS_DIR, { withFileTypes: true });
    const records = await Promise.all(
      entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map(async (entry) => {
          const filePath = path.join(BOOKINGS_DIR, entry.name);
          const raw = await fs.readFile(filePath, "utf-8");
          return JSON.parse(raw) as BookingRecord;
        })
    );
    return records;
  } catch {
    return [];
  }
}

export async function readBookings(): Promise<BookingRecord[]> {
  const [legacy, directory] = await Promise.all([readLegacyRecords(), readDirectoryRecords()]);
  if (legacy.length === 0) {
    return directory;
  }
  const byId = new Map<string, BookingRecord>();
  for (const record of [...legacy, ...directory]) {
    byId.set(record.id, record);
  }
  return Array.from(byId.values());
}

export async function addBooking(booking: Omit<BookingRecord, "id" | "createdAt">): Promise<BookingRecord> {
  await ensureBookingsDir();
  const id = crypto.randomUUID();
  const record: BookingRecord = {
    ...booking,
    id,
    createdAt: getTorontoNowISOString()
  };
  const filePath = path.join(BOOKINGS_DIR, `${id}.json`);
  await fs.writeFile(filePath, JSON.stringify(record, null, 2), "utf-8");
  return record;
}

export async function findBooking(id: string): Promise<BookingRecord | undefined> {
  try {
    await ensureBookingsDir();
    const filePath = path.join(BOOKINGS_DIR, `${id}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as BookingRecord;
  } catch {
    const legacy = await readLegacyRecords();
    return legacy.find((booking) => booking.id === id);
  }
}
