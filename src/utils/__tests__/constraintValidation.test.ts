import { describe, it, expect, beforeEach } from "vitest";
import {
  validateTrainingConstraints,
  generateAltitudeWarning,
  ALTITUDE_THRESHOLDS,
} from "../constraintValidation";
import type {
  TrainingConstraints,
  FitnessAssessment,
} from "../../types";

describe("constraintValidation", () => {
  let baseConstraints: TrainingConstraints;
  let baseFitnessAssessment: FitnessAssessment;

  beforeEach(() => {
    baseConstraints = {
      availableTrainingDays: [true, false, true, false, true, false, true], // 4 days
      sessionDuration: 60,
      goalRace: "10K",
      trainingAltitude: undefined,
    };

    baseFitnessAssessment = {
      experienceLevel: "recreational",
      currentWeeklyMileage: 20,
      raceInput: {
        distance: "10K",
        time: "45:00",
      },
      calculatedFitnessScore: 45,
      recommendedPlanLevel: "intermediate",
      selectedPlanLevel: "intermediate",
    };
  });

  describe("validateTrainingConstraints", () => {
    describe("training days validation", () => {
      it("should validate sufficient training days for plan level", () => {
        const result = validateTrainingConstraints(
          baseConstraints,
          "recreational",
          "metric"
        );

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
        expect(result.compatibility.withPlanLevel).toBe(true);
      });

      it("should warn when training days are insufficient for plan level", () => {
        const constraints = {
          ...baseConstraints,
          availableTrainingDays: [
            true,
            false,
            true,
            false,
            false,
            false,
            false,
          ], // 2 days
        };

        const result = validateTrainingConstraints(
          constraints,
          "serious",
          "metric"
        );

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain(
          expect.stringContaining("The advanced plan typically requires")
        );
        expect(result.compatibility.withPlanLevel).toBe(false);
      });

      it("should enforce minimum 3 training days", () => {
        const constraints = {
          ...baseConstraints,
          availableTrainingDays: [
            true,
            false,
            true,
            false,
            false,
            false,
            false,
          ], // 2 days
        };

        const result = validateTrainingConstraints(
          constraints,
          "foundation",
          "metric"
        );

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain(
          "A minimum of 3 training days per week is recommended for effective progress and injury prevention."
        );
      });

      it("should validate different plan level requirements", () => {
        const testCases = [
          { plan: "foundation", days: 3, shouldPass: true },
          { plan: "recreational", days: 3, shouldPass: true },
          { plan: "serious", days: 4, shouldPass: true },
          { plan: "competitive", days: 5, shouldPass: true },
          { plan: "competitive", days: 3, shouldPass: false },
        ];

        testCases.forEach(({ plan, days, shouldPass }) => {
          const constraints = {
            ...baseConstraints,
            availableTrainingDays: Array(7)
              .fill(false)
              .map((_, i) => i < days),
          };

          const result = validateTrainingConstraints(
            constraints,
            plan,
            "metric"
          );
          expect(result.compatibility.withPlanLevel).toBe(shouldPass);
        });
      });
    });

    describe("session duration validation", () => {
      it("should validate appropriate session duration for plan level", () => {
        const constraints = {
          ...baseConstraints,
          sessionDuration: 75, // Good for intermediate
        };

        const result = validateTrainingConstraints(
          constraints,
          "recreational",
          "metric"
        );

        expect(result.compatibility.withPlanLevel).toBe(true);
      });

      it("should warn when session duration is too short for plan level", () => {
        const constraints = {
          ...baseConstraints,
          sessionDuration: 30, // Too short for advanced
        };

        const result = validateTrainingConstraints(
          constraints,
          "advanced",
          "metric"
        );

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain(
          expect.stringContaining(
            "Your session duration (30 min) is below the typical range"
          )
        );
        expect(result.compatibility.withPlanLevel).toBe(false);
      });

      it("should warn when session duration is excessively long", () => {
        const constraints = {
          ...baseConstraints,
          sessionDuration: 180, // Very long
        };

        const result = validateTrainingConstraints(
          constraints,
          "foundation",
          "metric"
        );

        expect(result.warnings).toContain(
          expect.stringContaining("significantly above the typical range")
        );
      });
    });

    describe("goal race compatibility validation", () => {
      it("should warn about ambitious goal races for foundation plan", () => {
        const constraints = {
          ...baseConstraints,
          goalRace: "Marathon",
        };

        const result = validateTrainingConstraints(
          constraints,
          "foundation",
          "metric"
        );

        expect(result.isValid).toBe(false);
        expect(result.warnings).toContain(
          expect.stringContaining(
            "The Marathon is an ambitious goal for the Foundation plan"
          )
        );
        expect(result.compatibility.withGoalRace).toBe(false);
      });

      it("should warn about elite 5K training with insufficient days", () => {
        const constraints = {
          ...baseConstraints,
          goalRace: "5K",
          availableTrainingDays: [true, false, true, false, true, false, false], // 3 days
        };

        const result = validateTrainingConstraints(
          constraints,
          "elite",
          "metric"
        );

        expect(result.warnings).toContain(
          expect.stringContaining(
            "Elite-level 5K training typically benefits from 6-7 training days"
          )
        );
      });

      it("should validate compatible goal races", () => {
        const constraints = {
          ...baseConstraints,
          goalRace: "10K",
        };

        const result = validateTrainingConstraints(
          constraints,
          "recreational",
          "metric"
        );

        expect(result.compatibility.withGoalRace).toBe(true);
      });
    });

    describe("altitude validation", () => {
      it("should not warn for altitude below threshold", () => {
        const constraints = {
          ...baseConstraints,
          trainingAltitude: 500, // Below threshold
        };

        const result = validateTrainingConstraints(
          constraints,
          "intermediate",
          "metric"
        );

        expect(result.warnings).not.toContain(
          expect.stringContaining("altitude")
        );
      });

      it("should warn for altitude above threshold in metric units", () => {
        const constraints = {
          ...baseConstraints,
          trainingAltitude: 1500, // Above 914m threshold
        };

        const result = validateTrainingConstraints(
          constraints,
          "intermediate",
          "metric"
        );

        expect(result.warnings).toContain(
          expect.stringContaining("Training at 1,500 m may affect performance")
        );
      });

      it("should warn for altitude above threshold in imperial units", () => {
        const constraints = {
          ...baseConstraints,
          trainingAltitude: 5000, // Above 3000ft threshold
        };

        const result = validateTrainingConstraints(
          constraints,
          "intermediate",
          "imperial"
        );

        expect(result.warnings).toContain(
          expect.stringContaining("Training at 5,000 ft")
        );
      });

      it("should provide pace adjustment warning for high altitude", () => {
        const constraints = {
          ...baseConstraints,
          trainingAltitude: 2500, // Above baseline in metric
        };

        const result = validateTrainingConstraints(
          constraints,
          "intermediate",
          "metric"
        );

        expect(result.warnings).toContain(
          expect.stringContaining(
            "training paces should be 4-6 seconds per 400m slower"
          )
        );
      });
    });

    describe("experience compatibility validation", () => {
      it("should validate compatible experience and constraints", () => {
        const result = validateTrainingConstraints(
          baseConstraints,
          "intermediate",
          "metric",
          baseFitnessAssessment
        );

        expect(result.compatibility.withExperience).toBe(true);
      });

      it("should warn about experience mismatches", () => {
        const beginnerFitness = {
          ...baseFitnessAssessment,
          experienceLevel: "beginner" as const,
          currentWeeklyMileage: 5,
        };

        const result = validateTrainingConstraints(
          baseConstraints,
          "elite",
          "metric",
          beginnerFitness
        );

        expect(result.compatibility.withExperience).toBe(false);
      });
    });

    describe("unit system handling", () => {
      it("should handle metric unit system correctly", () => {
        const constraints = {
          ...baseConstraints,
          trainingAltitude: 1000,
        };

        const result = validateTrainingConstraints(
          constraints,
          "intermediate",
          "metric"
        );

        expect(result.warnings).toContain(expect.stringContaining("1,000 m"));
      });

      it("should handle imperial unit system correctly", () => {
        const constraints = {
          ...baseConstraints,
          trainingAltitude: 4000,
        };

        const result = validateTrainingConstraints(
          constraints,
          "intermediate",
          "imperial"
        );

        expect(result.warnings).toContain(expect.stringContaining("4,000 ft"));
      });
    });

    describe("overall validation result", () => {
      it("should return valid result when all constraints pass", () => {
        const validConstraints = {
          ...baseConstraints,
          availableTrainingDays: [true, false, true, false, true, false, true], // 4 days
          sessionDuration: 75,
          goalRace: "10K" as const,
          trainingAltitude: 200,
        };

        const result = validateTrainingConstraints(
          validConstraints,
          "intermediate",
          "metric"
        );

        expect(result.isValid).toBe(true);
        expect(result.warnings).toHaveLength(0);
      });

      it("should return invalid result when constraints fail", () => {
        const invalidConstraints = {
          ...baseConstraints,
          availableTrainingDays: [
            true,
            false,
            true,
            false,
            false,
            false,
            false,
          ], // 2 days
          sessionDuration: 20,
          goalRace: "Marathon" as const,
        };

        const result = validateTrainingConstraints(
          invalidConstraints,
          "foundation",
          "metric"
        );

        expect(result.isValid).toBe(false);
        expect(result.warnings.length).toBeGreaterThan(0);
      });
    });
  });

  describe("generateAltitudeWarning", () => {
    describe("metric units", () => {
      it("should return null for altitude below threshold", () => {
        const warning = generateAltitudeWarning(800, "metric");
        expect(warning).toBeNull();
      });

      it("should return performance warning for moderate altitude", () => {
        const warning = generateAltitudeWarning(1500, "metric");
        expect(warning).toContain("Training at 1,500 m may affect performance");
      });

      it("should return pace adjustment warning for high altitude", () => {
        const warning = generateAltitudeWarning(2500, "metric");
        expect(warning).toContain(
          "training paces should be 4-6 seconds per 400m slower"
        );
      });

      it("should use baseline threshold correctly", () => {
        const warning = generateAltitudeWarning(
          ALTITUDE_THRESHOLDS.metric.baseline,
          "metric"
        );
        expect(warning).toContain("pace adjustments");
      });
    });

    describe("imperial units", () => {
      it("should return null for altitude below threshold", () => {
        const warning = generateAltitudeWarning(2000, "imperial");
        expect(warning).toBeNull();
      });

      it("should return performance warning for moderate altitude", () => {
        const warning = generateAltitudeWarning(4000, "imperial");
        expect(warning).toContain(
          "Training at 4,000 ft may affect performance"
        );
      });

      it("should return pace adjustment warning for high altitude", () => {
        const warning = generateAltitudeWarning(8000, "imperial");
        expect(warning).toContain(
          "training paces should be 4-6 seconds per 400m slower"
        );
      });

      it("should use baseline threshold correctly", () => {
        const warning = generateAltitudeWarning(
          ALTITUDE_THRESHOLDS.imperial.baseline,
          "imperial"
        );
        expect(warning).toContain("pace adjustments");
      });
    });

    describe("threshold constants", () => {
      it("should have correct altitude thresholds", () => {
        expect(ALTITUDE_THRESHOLDS.metric.minimum).toBe(914);
        expect(ALTITUDE_THRESHOLDS.metric.baseline).toBe(2134);
        expect(ALTITUDE_THRESHOLDS.imperial.minimum).toBe(3000);
        expect(ALTITUDE_THRESHOLDS.imperial.baseline).toBe(7000);
      });

      it("should have correct unit labels", () => {
        expect(ALTITUDE_THRESHOLDS.metric.unit).toBe("m");
        expect(ALTITUDE_THRESHOLDS.imperial.unit).toBe("ft");
      });
    });
  });

  describe("edge cases", () => {
    it("should handle undefined fitness assessment", () => {
      const result = validateTrainingConstraints(
        baseConstraints,
        "intermediate",
        "metric",
        undefined
      );

      expect(result.compatibility.withExperience).toBe(true);
    });

    it("should handle undefined training altitude", () => {
      const constraints = {
        ...baseConstraints,
        trainingAltitude: undefined,
      };

      const result = validateTrainingConstraints(
        constraints,
        "intermediate",
        "metric"
      );

      expect(result.warnings).not.toContain(
        expect.stringContaining("altitude")
      );
    });

    it("should handle invalid goal race", () => {
      const constraints = {
        ...baseConstraints,
        goalRace: "InvalidRace" as any,
      };

      const result = validateTrainingConstraints(
        constraints,
        "intermediate",
        "metric"
      );

      expect(result.compatibility.withGoalRace).toBe(true);
    });

    it("should handle zero training days", () => {
      const constraints = {
        ...baseConstraints,
        availableTrainingDays: [
          false,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
      };

      const result = validateTrainingConstraints(
        constraints,
        "foundation",
        "metric"
      );

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        expect.stringContaining("minimum of 3 training days")
      );
    });

    it("should handle maximum training days", () => {
      const constraints = {
        ...baseConstraints,
        availableTrainingDays: [true, true, true, true, true, true, true], // 7 days
      };

      const result = validateTrainingConstraints(
        constraints,
        "elite",
        "metric"
      );

      expect(result.compatibility.withPlanLevel).toBe(true);
    });

    it("should handle extreme session durations", () => {
      const shortSession = {
        ...baseConstraints,
        sessionDuration: 1,
      };

      const longSession = {
        ...baseConstraints,
        sessionDuration: 300,
      };

      const shortResult = validateTrainingConstraints(
        shortSession,
        "intermediate",
        "metric"
      );

      const longResult = validateTrainingConstraints(
        longSession,
        "foundation",
        "metric"
      );

      expect(shortResult.compatibility.withPlanLevel).toBe(false);
      expect(longResult.warnings).toContain(
        expect.stringContaining("significantly above the typical range")
      );
    });
  });
});
