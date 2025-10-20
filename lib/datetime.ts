import { MINIMUM_NOTICE_DAYS } from "./constants";

const TORONTO_TIME_ZONE = "America/Toronto";

function extractDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TORONTO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((part) => part.type === "year")?.value ?? "0");
  const month = Number(parts.find((part) => part.type === "month")?.value ?? "1");
  const day = Number(parts.find((part) => part.type === "day")?.value ?? "1");

  return { year, month, day };
}

export function getTorontoToday() {
  const { year, month, day } = extractDateParts(new Date());
  return new Date(Date.UTC(year, month - 1, day));
}

export function getTorontoTodayDate() {
  return getTorontoToday();
}

function extractDateTimeParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TORONTO_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);

  const getValue = (type: Intl.DateTimeFormatPartTypes, fallback = "00") =>
    parts.find((part) => part.type === type)?.value ?? fallback;

  return {
    year: getValue("year", "0000"),
    month: getValue("month", "01"),
    day: getValue("day", "01"),
    hour: getValue("hour"),
    minute: getValue("minute"),
    second: getValue("second")
  };
}

export function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCHours(0, 0, 0, 0);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isSelectableBookingDate(
  date: Date,
  minimumNoticeDays = MINIMUM_NOTICE_DAYS
) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }

  const normalizedCandidate = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );

  const minimumSelectableTime = addDays(getTorontoToday(), minimumNoticeDays).getTime();

  return normalizedCandidate >= minimumSelectableTime;
}

function normalizeOffset(hours: number, minutes: number) {
  const sign = hours >= 0 ? "+" : "-";
  const absHours = Math.abs(hours).toString().padStart(2, "0");
  const absMinutes = Math.abs(minutes).toString().padStart(2, "0");
  return `${sign}${absHours}:${absMinutes}`;
}

function extractOffset(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TORONTO_TIME_ZONE,
    timeZoneName: "shortOffset",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const offsetPart = formatter
    .formatToParts(date)
    .find((part) => part.type === "timeZoneName")?.value;

  if (!offsetPart) {
    return undefined;
  }

  const match = offsetPart.match(/([+-]\d{1,2})(?::?(\d{2}))?/);
  if (!match) {
    if (offsetPart.includes("-4")) {
      return "-04:00";
    }
    if (offsetPart.includes("-5")) {
      return "-05:00";
    }
    return undefined;
  }

  const hours = Number(match[1]);
  const minutes = match[2] ? Number(match[2]) : 0;
  return normalizeOffset(hours, minutes);
}

export function toTorontoDateISOString(dateString: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }
  const [yearString, monthString, dayString] = dateString.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);
  const referenceDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offset = extractOffset(referenceDate);
  if (!offset) {
    return null;
  }
  return `${yearString}-${monthString}-${dayString}T00:00:00${offset}`;
}

export function isoStringToDateInput(isoString: string) {
  const match = isoString.match(/^(\d{4}-\d{2}-\d{2})T/);
  return match ? match[1] : "";
}

export function getTorontoNowISOString() {
  const now = new Date();
  const offset = extractOffset(now);
  if (!offset) {
    return now.toISOString();
  }
  const { year, month, day, hour, minute, second } = extractDateTimeParts(now);
  return `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`;
}
