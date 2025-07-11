import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  CONVERSION_FACTORS,
  createUnitPreferences,
  convertDistance,
  convertPace,
  formatDistance,
  detectDefaultUnitSystem,
  generatePreviewExamples,
} from "../unitConversion";

describe("unitConversion", () => {
  describe("CONVERSION_FACTORS", () => {
    it("should have correct conversion factors", () => {
      expect(CONVERSION_FACTORS.kmToMiles).toBeCloseTo(0.621371);
      expect(CONVERSION_FACTORS.milesToKm).toBeCloseTo(1.609344);
      expect(CONVERSION_FACTORS.metersToFeet).toBeCloseTo(3.28084);
      expect(CONVERSION_FACTORS.feetToMeters).toBeCloseTo(0.3048);
      expect(CONVERSION_FACTORS.paceKmToMile).toBeCloseTo(1.609344);
      expect(CONVERSION_FACTORS.paceMileToKm).toBeCloseTo(0.621371);
    });
  });

  describe("createUnitPreferences", () => {
    it("should create metric unit preferences", () => {
      const result = createUnitPreferences("metric");
      expect(result).toEqual({
        system: "metric",
        paceUnit: "min/km",
        distanceUnit: "km",
        altitudeUnit: "m",
      });
    });

    it("should create imperial unit preferences", () => {
      const result = createUnitPreferences("imperial");
      expect(result).toEqual({
        system: "imperial",
        paceUnit: "min/mi",
        distanceUnit: "mi",
        altitudeUnit: "ft",
      });
    });
  });

  describe("convertDistance", () => {
    it("should return same value for same units", () => {
      expect(convertDistance(5, "km", "km")).toBe(5);
      expect(convertDistance(3.1, "mi", "mi")).toBe(3.1);
    });

    it("should convert kilometers to miles", () => {
      expect(convertDistance(5, "km", "mi")).toBeCloseTo(3.107, 2);
      expect(convertDistance(10, "km", "mi")).toBeCloseTo(6.214, 2);
    });

    it("should convert miles to kilometers", () => {
      expect(convertDistance(3.1, "mi", "km")).toBeCloseTo(4.989, 2);
      expect(convertDistance(6.2, "mi", "km")).toBeCloseTo(9.978, 2);
    });

    it("should convert meters to feet", () => {
      expect(convertDistance(1000, "m", "ft")).toBeCloseTo(3280.84, 1);
      expect(convertDistance(1500, "m", "ft")).toBeCloseTo(4921.26, 1);
    });

    it("should convert feet to meters", () => {
      expect(convertDistance(3280.84, "ft", "m")).toBeCloseTo(1000, 1);
      expect(convertDistance(4921.26, "ft", "m")).toBeCloseTo(1500, 1);
    });

    it("should handle complex conversions through meters", () => {
      expect(convertDistance(1, "km", "ft")).toBeCloseTo(3280.84, 1);
      expect(convertDistance(1, "mi", "m")).toBeCloseTo(1609.344, 1);
    });

    it("should throw error for unknown units", () => {
      expect(() => convertDistance(1, "unknown" as any, "km")).toThrow(
        "Unknown distance unit: unknown"
      );
      expect(() => convertDistance(1, "km", "unknown" as any)).toThrow(
        "Unknown distance unit: unknown"
      );
    });
  });

  describe("convertPace", () => {
    it("should return same pace for same system", () => {
      expect(convertPace("5:30", "metric", "metric")).toBe("5:30");
      expect(convertPace("8:51", "imperial", "imperial")).toBe("8:51");
    });

    it("should convert metric pace to imperial", () => {
      expect(convertPace("5:30", "metric", "imperial")).toBe("8:51");
      expect(convertPace("4:15", "metric", "imperial")).toBe("6:50");
    });

    it("should convert imperial pace to metric", () => {
      expect(convertPace("8:51", "imperial", "metric")).toBe("5:30");
      expect(convertPace("6:50", "imperial", "metric")).toBe("4:15");
    });

    it("should handle single digit seconds", () => {
      expect(convertPace("5:05", "metric", "imperial")).toBe("8:10");
    });

    it("should handle edge cases with rounding", () => {
      expect(convertPace("6:00", "metric", "imperial")).toBe("9:39");
      expect(convertPace("3:30", "metric", "imperial")).toBe("5:38");
    });

    it("should throw error for invalid pace format", () => {
      expect(() => convertPace("invalid", "metric", "imperial")).toThrow(
        "Invalid pace format: invalid"
      );
      expect(() => convertPace("5:xx", "metric", "imperial")).toThrow(
        "Invalid pace format: 5:xx"
      );
      expect(() => convertPace("", "metric", "imperial")).toThrow(
        "Invalid pace format: "
      );
    });
  });

  describe("formatDistance", () => {
    it("should format whole numbers without decimal", () => {
      expect(formatDistance(5, "km")).toBe("5 km");
      expect(formatDistance(10, "mi")).toBe("10 mi");
    });

    it("should format decimals with specified precision", () => {
      expect(formatDistance(5.123, "km", 1)).toBe("5.1 km");
      expect(formatDistance(3.14159, "mi", 2)).toBe("3.14 mi");
    });

    it("should use default precision of 1", () => {
      expect(formatDistance(5.678, "km")).toBe("5.7 km");
    });

    it("should handle zero precision", () => {
      expect(formatDistance(5.678, "km", 0)).toBe("6 km");
    });
  });

  describe("detectDefaultUnitSystem", () => {
    beforeEach(() => {
      // Reset navigator mock
      vi.clearAllMocks();
    });

    it("should return imperial for US locale", () => {
      Object.defineProperty(navigator, "language", {
        value: "en-US",
        configurable: true,
      });
      expect(detectDefaultUnitSystem()).toBe("imperial");
    });

    it("should return metric for UK locale", () => {
      Object.defineProperty(navigator, "language", {
        value: "en-GB",
        configurable: true,
      });
      expect(detectDefaultUnitSystem()).toBe("metric");
    });

    it("should return imperial for Liberia", () => {
      Object.defineProperty(navigator, "language", {
        value: "en-LR",
        configurable: true,
      });
      expect(detectDefaultUnitSystem()).toBe("imperial");
    });

    it("should return metric for most other countries", () => {
      Object.defineProperty(navigator, "language", {
        value: "fr-FR",
        configurable: true,
      });
      expect(detectDefaultUnitSystem()).toBe("metric");
    });

    it("should return metric as fallback when locale detection fails", () => {
      Object.defineProperty(navigator, "language", {
        value: undefined,
        configurable: true,
      });
      expect(detectDefaultUnitSystem()).toBe("metric");
    });

    it("should handle missing country code", () => {
      Object.defineProperty(navigator, "language", {
        value: "en",
        configurable: true,
      });
      expect(detectDefaultUnitSystem()).toBe("metric");
    });
  });

  describe("generatePreviewExamples", () => {
    it("should generate metric examples", () => {
      const examples = generatePreviewExamples("metric");
      expect(examples).toEqual({
        easyPace: "5:30 min/km",
        tempoPace: "4:15 min/km",
        shortDistance: "400 m",
        mediumDistance: "5.0 km",
        longDistance: "21.1 km",
        altitude: "1,500 m",
        weeklyMileage: "50 km/week",
      });
    });

    it("should generate imperial examples", () => {
      const examples = generatePreviewExamples("imperial");
      expect(examples).toEqual({
        easyPace: "8:51 min/mi",
        tempoPace: "6:50 min/mi",
        shortDistance: "400 yd",
        mediumDistance: "3.1 mi",
        longDistance: "13.1 mi",
        altitude: "4,921 ft",
        weeklyMileage: "31 mi/week",
      });
    });
  });
});
