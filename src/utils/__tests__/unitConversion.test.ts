import { describe, it, expect } from "vitest";
import {
  convertDistance,
  convertPace,
  createUnitPreferences,
  formatDistance,
} from "../unitConversion";

describe("Unit Conversion - Phase 1 Core", () => {
  describe("convertDistance", () => {
    it("converts km to miles", () => {
      expect(convertDistance(5, "km", "mi")).toBeCloseTo(3.11, 2);
    });

    it("converts miles to km", () => {
      expect(convertDistance(3.1, "mi", "km")).toBeCloseTo(4.99, 2);
    });

    it("converts meters to feet for altitude", () => {
      expect(convertDistance(914.4, "m", "ft")).toBeCloseTo(3000, 0);
    });

    it("returns same value for identical units", () => {
      expect(convertDistance(10, "km", "km")).toBe(10);
    });
  });

  describe("convertPace", () => {
    it("converts metric pace to imperial", () => {
      expect(convertPace("5:00", "metric", "imperial")).toBe("8:03");
    });

    it("converts imperial pace to metric", () => {
      expect(convertPace("8:00", "imperial", "metric")).toBe("4:58");
    });

    it("returns same pace for identical systems", () => {
      expect(convertPace("5:30", "metric", "metric")).toBe("5:30");
    });

    it("throws error for invalid pace format", () => {
      expect(() => convertPace("invalid", "metric", "imperial")).toThrow();
    });
  });

  describe("createUnitPreferences", () => {
    it("creates metric preferences", () => {
      const prefs = createUnitPreferences("metric");
      expect(prefs.system).toBe("metric");
      expect(prefs.paceUnit).toBe("min/km");
      expect(prefs.distanceUnit).toBe("km");
      expect(prefs.altitudeUnit).toBe("m");
    });

    it("creates imperial preferences", () => {
      const prefs = createUnitPreferences("imperial");
      expect(prefs.system).toBe("imperial");
      expect(prefs.paceUnit).toBe("min/mi");
      expect(prefs.distanceUnit).toBe("mi");
      expect(prefs.altitudeUnit).toBe("ft");
    });
  });

  describe("formatDistance", () => {
    it("formats whole numbers without decimals", () => {
      expect(formatDistance(5, "km")).toBe("5 km");
    });

    it("formats decimals with specified precision", () => {
      expect(formatDistance(5.123, "mi", 1)).toBe("5.1 mi");
    });
  });
});