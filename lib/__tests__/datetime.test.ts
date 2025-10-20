import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MINIMUM_NOTICE_DAYS } from "../constants";
import { getTorontoToday, isSelectableBookingDate } from "../datetime";

describe("Toronto date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getTorontoToday", () => {
    it("normalizes to the Toronto calendar date across DST start", () => {
      vi.setSystemTime(new Date("2024-03-10T07:30:00.000Z"));

      const today = getTorontoToday();

      expect(today.toISOString()).toBe("2024-03-10T00:00:00.000Z");
      expect(today.getUTCHours()).toBe(0);
    });

    it("normalizes to the Toronto calendar date across DST end", () => {
      vi.setSystemTime(new Date("2024-11-03T10:30:00.000Z"));

      const today = getTorontoToday();

      expect(today.toISOString()).toBe("2024-11-03T00:00:00.000Z");
      expect(today.getUTCHours()).toBe(0);
    });
  });

  describe("isSelectableBookingDate", () => {
    it("returns false for dates inside the minimum notice window", () => {
      vi.setSystemTime(new Date("2024-03-01T17:00:00.000Z"));

      const insideWindow = new Date(Date.UTC(2024, 2, 21));

      expect(isSelectableBookingDate(insideWindow)).toBe(false);
    });

    it("allows the first date that satisfies the minimum notice", () => {
      vi.setSystemTime(new Date("2024-03-01T17:00:00.000Z"));

      const firstValid = new Date(Date.UTC(2024, 2, 22));

      expect(isSelectableBookingDate(firstValid)).toBe(true);
    });

    it("handles notice calculations across the fall DST transition", () => {
      vi.setSystemTime(new Date("2024-10-20T16:00:00.000Z"));

      const tooSoon = new Date(Date.UTC(2024, 10, 9));
      const valid = new Date(Date.UTC(2024, 10, 10));

      expect(isSelectableBookingDate(tooSoon)).toBe(false);
      expect(isSelectableBookingDate(valid)).toBe(true);
    });

    it("returns false when provided an invalid date", () => {
      // @ts-expect-error intentionally passing an invalid date
      expect(isSelectableBookingDate(new Date(NaN))).toBe(false);
    });

    it("supports custom notice windows", () => {
      vi.setSystemTime(new Date("2024-03-01T17:00:00.000Z"));

      const shorterWindowDate = new Date(Date.UTC(2024, 2, 10));

      expect(isSelectableBookingDate(shorterWindowDate, 5)).toBe(true);
      expect(MINIMUM_NOTICE_DAYS).toBe(21);
    });
  });
});
