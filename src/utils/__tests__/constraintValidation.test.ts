import { describe, it, expect } from "vitest";
import {
  validateTrainingConstraints,
  ALTITUDE_THRESHOLDS,
  isAboveAltitudeThreshold,
} from "../constraintValidation";
import type { TrainingConstraints } from "../../types";

describe("constraintValidation - Phase 1 Core", () => {
  const mockConstraints: TrainingConstraints = {
    availableTrainingDays: [true, true, true, false, false, false, false],
    sessionDuration: 60,
    goalRace: "5K",
    trainingAltitude: 500,
  };

  describe("validateTrainingConstraints", () => {
    it("should return valid result for valid constraints", () => {
      const result = validateTrainingConstraints(
        mockConstraints,
        "foundation",
        "metric"
      );

      expect(result).toHaveProperty("isValid");
      expect(result).toHaveProperty("warnings");
      expect(result).toHaveProperty("compatibility");
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it("should require minimum 3 training days", () => {
      const constraints = {
        ...mockConstraints,
        availableTrainingDays: [true, true, false, false, false, false, false],
      };

      const result = validateTrainingConstraints(
        constraints,
        "foundation",
        "metric"
      );

      expect(result.isValid).toBe(false);
      expect(
        result.warnings.some((w) => w.includes("minimum of 3 training days"))
      ).toBe(true);
    });
  });

  describe("altitude thresholds", () => {
    it("should have correct metric threshold", () => {
      expect(ALTITUDE_THRESHOLDS.metric.minimum).toBe(914);
      expect(ALTITUDE_THRESHOLDS.metric.unit).toBe("m");
    });

    it("should have correct imperial threshold", () => {
      expect(ALTITUDE_THRESHOLDS.imperial.minimum).toBe(3000);
      expect(ALTITUDE_THRESHOLDS.imperial.unit).toBe("ft");
    });

    it("should detect altitude above threshold", () => {
      expect(isAboveAltitudeThreshold(1000, "metric")).toBe(true);
      expect(isAboveAltitudeThreshold(500, "metric")).toBe(false);
      expect(isAboveAltitudeThreshold(3500, "imperial")).toBe(true);
      expect(isAboveAltitudeThreshold(2000, "imperial")).toBe(false);
    });
  });
});
