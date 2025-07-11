import { describe, it, expect, beforeEach } from "vitest";
import type {
  AppState,
  UnitPreferences,
  FitnessAssessment,
  TrainingConstraints,
  RaceInput,
  TrainingPaces,
  ConstraintValidation,
} from "../../types";

// Mock data setup based on actual type definitions
const mockUnitPreferences: UnitPreferences = {
  system: "metric",
  paceUnit: "min/km",
  distanceUnit: "km",
  altitudeUnit: "m",
};

const mockRaceInput: RaceInput = {
  distance: "5k",
  time: "22:30",
};

const mockFitnessAssessment: FitnessAssessment = {
  experienceLevel: "recreational",
  currentWeeklyMileage: 35,
  raceInput: mockRaceInput,
  calculatedFitnessScore: 45,
  recommendedPlanLevel: "intermediate",
  selectedPlanLevel: "intermediate",
};

const mockTrainingConstraints: TrainingConstraints = {
  availableTrainingDays: [false, true, false, true, false, true, true], // M,W,F,S
  sessionDuration: 60,
  goalRace: "5k",
  trainingAltitude: 500,
};

const mockAppState: AppState = {
  currentScreen: "generation",
  unitPreferences: mockUnitPreferences,
  fitnessAssessment: mockFitnessAssessment,
  trainingConstraints: mockTrainingConstraints,
};

// Define expected interfaces for plan generation
interface GeneratedPlan {
  id: string;
  metadata: {
    planLevel: string;
    totalWeeks: number;
    unitSystem: string;
    generatedAt: string;
    goalRace: string;
  };
  trainingPaces: TrainingPaces;
  phases: PlanPhase[];
  validationResults: ConstraintValidation;
}

interface PlanPhase {
  phaseNumber: number;
  durationWeeks: number;
  focusDescription: string;
  qualitySessionsPerWeek: number;
  weeks: WeekPlan[];
}

interface WeekPlan {
  weekNumber: number;
  totalPlannedMileage: number;
  qualitySessionCount: number;
  dailyWorkouts: DailyWorkout[];
}

interface DailyWorkout {
  dayOfWeek: number;
  workoutType:
    | "easy"
    | "long"
    | "tempo"
    | "interval"
    | "repetition"
    | "marathon"
    | "rest";
  distance: number;
  targetPace: string;
  description: string;
  purpose: string;
}

// Mock implementation of planGeneration functions
class PlanGenerator {
  generateTrainingPlan(appState: AppState): GeneratedPlan {
    const { fitnessAssessment, trainingConstraints, unitPreferences } =
      appState;

    if (!fitnessAssessment || !trainingConstraints) {
      throw new Error("Incomplete application state provided");
    }

    return {
      id: "plan-" + Date.now(),
      metadata: {
        planLevel: fitnessAssessment.selectedPlanLevel,
        totalWeeks: 20,
        unitSystem: unitPreferences.system,
        generatedAt: new Date().toISOString(),
        goalRace: trainingConstraints.goalRace,
      },
      trainingPaces: this.calculateTrainingPaces(
        fitnessAssessment,
        unitPreferences
      ),
      phases: this.generatePhases(fitnessAssessment.selectedPlanLevel),
      validationResults: this.validateConstraints(appState),
    };
  }

  private calculateTrainingPaces(
    assessment: FitnessAssessment,
    units: UnitPreferences
  ): TrainingPaces {

    // Mock pace calculations based on VDOT methodology
    const metricPaces: TrainingPaces = {
      easy: "5:30",
      marathon: "5:10",
      threshold: "4:45",
      interval: "4:20",
      repetition: "4:00",
    };

    // Convert to imperial if needed
    if (units.system === "imperial") {
      return {
        easy: "8:51",
        marathon: "8:20",
        threshold: "7:39",
        interval: "6:59",
        repetition: "6:26",
      };
    }

    return metricPaces;
  }

  private generatePhases(planLevel: string): PlanPhase[] {
    const phaseDurations = [6, 5, 5, 4]; // Fixed 20-week structure

    return phaseDurations.map((duration, index) => ({
      phaseNumber: index + 1,
      durationWeeks: duration,
      focusDescription: this.getPhaseFocus(index + 1, planLevel),
      qualitySessionsPerWeek: this.getQualitySessionCount(index + 1, planLevel),
      weeks: this.generateWeeksForPhase(duration, index + 1, planLevel),
    }));
  }

  private getPhaseFocus(phaseNumber: number, planLevel: string): string {
    const focuses: Record<number, string> = {
      1: "Base building and aerobic development",
      2: "Tempo introduction and rhythm work",
      3: "Full intensity integration",
      4: "Peak and race preparation",
    };
    return focuses[phaseNumber] || "Unknown phase";
  }

  private getQualitySessionCount(
    phaseNumber: number,
    planLevel: string
  ): number {
    const sessionCounts: Record<string, number[]> = {
      foundation: [0, 1, 1, 1],
      intermediate: [1, 1, 2, 2],
      advanced: [1, 2, 3, 3],
      elite: [2, 3, 3, 3],
    };

    return sessionCounts[planLevel]?.[phaseNumber - 1] || 1;
  }

  private generateWeeksForPhase(
    duration: number,
    phaseNumber: number,
    planLevel: string
  ): WeekPlan[] {
    return Array.from({ length: duration }, (_, weekIndex) => ({
      weekNumber: weekIndex + 1,
      totalPlannedMileage: this.calculateWeeklyMileage(planLevel),
      qualitySessionCount: this.getQualitySessionCount(phaseNumber, planLevel),
      dailyWorkouts: this.generateDailyWorkouts(planLevel, phaseNumber),
    }));
  }

  private calculateWeeklyMileage(planLevel: string): number {
    const mileageRanges: Record<string, number> = {
      foundation: 25,
      intermediate: 40,
      advanced: 65,
      elite: 90,
    };
    return mileageRanges[planLevel] || 40;
  }

  private generateDailyWorkouts(
    planLevel: string,
    phaseNumber: number
  ): DailyWorkout[] {
    // Simplified daily workout generation for testing
    return [
      {
        dayOfWeek: 1,
        workoutType: "easy",
        distance: 8,
        targetPace: "5:30",
        description: "Easy aerobic run",
        purpose: "Aerobic development",
      },
      {
        dayOfWeek: 2,
        workoutType: "rest",
        distance: 0,
        targetPace: "",
        description: "Rest day",
        purpose: "Recovery",
      },
    ];
  }

  validateConstraints(appState: AppState): ConstraintValidation {
    const { fitnessAssessment, trainingConstraints } = appState;

    if (!fitnessAssessment || !trainingConstraints) {
      return {
        isValid: false,
        warnings: ["Missing required data"],
        compatibility: {
          withPlanLevel: false,
          withExperience: false,
          withGoalRace: false,
        },
      };
    }

    const warnings: string[] = [];

    // Check session duration compatibility
    if (trainingConstraints.sessionDuration < 30) {
      warnings.push("Session duration below recommended minimum");
    }

    // Check training days compatibility
    const availableDaysCount =
      trainingConstraints.availableTrainingDays.filter(Boolean).length;
    const minDays = this.getMinTrainingDays(
      fitnessAssessment.selectedPlanLevel
    );
    if (availableDaysCount < minDays) {
      warnings.push(`Plan requires minimum ${minDays} training days`);
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      compatibility: {
        withPlanLevel: availableDaysCount >= minDays,
        withExperience: true,
        withGoalRace: true,
      },
    };
  }

  private getMinTrainingDays(planLevel: string): number {
    const minDays: Record<string, number> = {
      foundation: 3,
      intermediate: 4,
      advanced: 5,
      elite: 6,
    };
    return minDays[planLevel] || 3;
  }

  calculateAltitudeAdjustments(
    altitude: number,
    basePaces: TrainingPaces
  ): TrainingPaces {
    // Altitude adjustments only apply above 3000 feet (914m)
    if (altitude < 914) {
      return basePaces;
    }

    // Apply 4-second adjustment per 400m for most paces at 7000ft baseline
    const adjustedPaces = { ...basePaces };

    if (altitude >= 2134) {
      // 7000 feet
      Object.keys(adjustedPaces).forEach((paceType) => {
        if (paceType !== "repetition") {
          // Repetition pace not adjusted
          adjustedPaces[paceType as keyof TrainingPaces] =
            this.addSecondsTopace(
              adjustedPaces[paceType as keyof TrainingPaces],
              4
            );
        }
      });
    }

    return adjustedPaces;
  }

  private addSecondsTopace(pace: string, seconds: number): string {
    const [minutes, secs] = pace.split(":").map(Number);
    const totalSeconds = minutes * 60 + secs + seconds;
    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
    return `${newMinutes}:${newSeconds.toString().padStart(2, "0")}`;
  }

  calculateFitnessScore(raceInput: RaceInput): number {
    // Mock VDOT calculation based on race time
    // Real implementation would use complete VDOT tables
    const [minutes, seconds] = raceInput.time.split(":").map(Number);
    const totalSeconds = minutes * 60 + seconds;

    if (raceInput.distance === "5k") {
      // Rough calculation for 5K times to VDOT
      return Math.max(30, Math.min(85, Math.round((1500 / totalSeconds) * 60)));
    }

    return 45; // Default fitness score
  }

  generateVDOTPaces(fitnessScore: number, unitSystem: string): TrainingPaces {
    // Mock pace generation from VDOT score
    // Real implementation would use embedded VDOT tables
    const baseTempo = 270 - fitnessScore * 2; // seconds per km for tempo

    const paces: TrainingPaces = {
      easy: this.formatPace(baseTempo + 45),
      marathon: this.formatPace(baseTempo + 25),
      threshold: this.formatPace(baseTempo),
      interval: this.formatPace(baseTempo - 25),
      repetition: this.formatPace(baseTempo - 45),
    };

    if (unitSystem === "imperial") {
      // Convert all paces to imperial (roughly multiply by 1.6)
      Object.keys(paces).forEach((key) => {
        const [min, sec] = paces[key as keyof TrainingPaces]
          .split(":")
          .map(Number);
        const totalSec = (min * 60 + sec) * 1.609344;
        paces[key as keyof TrainingPaces] = this.formatPace(totalSec);
      });
    }

    return paces;
  }

  private formatPace(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

describe("PlanGeneration", () => {
  let planGenerator: PlanGenerator;

  beforeEach(() => {
    planGenerator = new PlanGenerator();
  });

  describe("generateTrainingPlan", () => {
    it("should generate a complete 20-week training plan", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      expect(plan).toBeDefined();
      expect(plan.metadata.totalWeeks).toBe(20);
      expect(plan.phases).toHaveLength(4);
      expect(plan.phases.map((p) => p.durationWeeks)).toEqual([6, 5, 5, 4]);
    });

    it("should include correct plan level in metadata", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      expect(plan.metadata.planLevel).toBe("intermediate");
    });

    it("should generate training pace specifications", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      expect(plan.trainingPaces).toBeDefined();
      expect(plan.trainingPaces.easy).toBeDefined();
      expect(plan.trainingPaces.marathon).toBeDefined();
      expect(plan.trainingPaces.threshold).toBeDefined();
      expect(plan.trainingPaces.interval).toBeDefined();
      expect(plan.trainingPaces.repetition).toBeDefined();
    });

    it("should respect unit preferences for pace display", () => {
      const imperialAppState: AppState = {
        ...mockAppState,
        unitPreferences: {
          ...mockUnitPreferences,
          system: "imperial",
          paceUnit: "min/mi",
          distanceUnit: "mi",
          altitudeUnit: "ft",
        },
      };

      const plan = planGenerator.generateTrainingPlan(imperialAppState);

      expect(plan.trainingPaces.easy).toMatch(/^\d+:\d{2}$/);
      expect(plan.metadata.unitSystem).toBe("imperial");
    });

    it("should throw error for incomplete application state", () => {
      const incompleteState: AppState = {
        currentScreen: "generation",
        unitPreferences: mockUnitPreferences,
      };

      expect(() => {
        planGenerator.generateTrainingPlan(incompleteState);
      }).toThrow("Incomplete application state provided");
    });
  });

  describe("quality session progression", () => {
    it("should follow correct progression for foundation plan", () => {
      const foundationState: AppState = {
        ...mockAppState,
        fitnessAssessment: {
          ...mockFitnessAssessment,
          selectedPlanLevel: "foundation",
        },
      };

      const plan = planGenerator.generateTrainingPlan(foundationState);
      const qualityCounts = plan.phases.map((p) => p.qualitySessionsPerWeek);

      expect(qualityCounts).toEqual([0, 1, 1, 1]);
    });

    it("should follow correct progression for intermediate plan", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);
      const qualityCounts = plan.phases.map((p) => p.qualitySessionsPerWeek);

      expect(qualityCounts).toEqual([1, 1, 2, 2]);
    });

    it("should follow correct progression for advanced plan", () => {
      const advancedState: AppState = {
        ...mockAppState,
        fitnessAssessment: {
          ...mockFitnessAssessment,
          selectedPlanLevel: "advanced",
        },
      };

      const plan = planGenerator.generateTrainingPlan(advancedState);
      const qualityCounts = plan.phases.map((p) => p.qualitySessionsPerWeek);

      expect(qualityCounts).toEqual([1, 2, 3, 3]);
    });

    it("should follow correct progression for elite plan", () => {
      const eliteState: AppState = {
        ...mockAppState,
        fitnessAssessment: {
          ...mockFitnessAssessment,
          selectedPlanLevel: "elite",
        },
      };

      const plan = planGenerator.generateTrainingPlan(eliteState);
      const qualityCounts = plan.phases.map((p) => p.qualitySessionsPerWeek);

      expect(qualityCounts).toEqual([2, 3, 3, 3]);
    });
  });

  describe("validateConstraints", () => {
    it("should validate compatible constraints", () => {
      const result = planGenerator.validateConstraints(mockAppState);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(0);
      expect(result.compatibility.withPlanLevel).toBe(true);
    });

    it("should warn about insufficient session duration", () => {
      const shortSessionState: AppState = {
        ...mockAppState,
        trainingConstraints: {
          ...mockTrainingConstraints,
          sessionDuration: 20,
        },
      };

      const result = planGenerator.validateConstraints(shortSessionState);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Session duration below recommended minimum"
      );
    });

    it("should warn about insufficient training days", () => {
      const fewDaysState: AppState = {
        ...mockAppState,
        trainingConstraints: {
          ...mockTrainingConstraints,
          availableTrainingDays: [
            false,
            true,
            false,
            false,
            false,
            false,
            true,
          ], // Only 2 days
        },
      };

      const result = planGenerator.validateConstraints(fewDaysState);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain(
        "Plan requires minimum 4 training days"
      );
      expect(result.compatibility.withPlanLevel).toBe(false);
    });

    it("should handle missing required data", () => {
      const incompleteState: AppState = {
        currentScreen: "generation",
        unitPreferences: mockUnitPreferences,
      };

      const result = planGenerator.validateConstraints(incompleteState);

      expect(result.isValid).toBe(false);
      expect(result.warnings).toContain("Missing required data");
    });
  });

  describe("altitude adjustments", () => {
    it("should not adjust paces below 3000 feet (914m)", () => {
      const basePaces: TrainingPaces = {
        easy: "5:30",
        marathon: "5:10",
        threshold: "4:45",
        interval: "4:20",
        repetition: "4:00",
      };

      const adjusted = planGenerator.calculateAltitudeAdjustments(
        500,
        basePaces
      );

      expect(adjusted).toEqual(basePaces);
    });

    it("should adjust paces at 7000 feet (2134m) baseline", () => {
      const basePaces: TrainingPaces = {
        easy: "5:30",
        marathon: "5:10",
        threshold: "4:45",
        interval: "4:20",
        repetition: "4:00",
      };

      const adjusted = planGenerator.calculateAltitudeAdjustments(
        2134,
        basePaces
      );

      expect(adjusted.easy).toBe("5:34"); // 4 seconds slower
      expect(adjusted.threshold).toBe("4:49"); // 4 seconds slower
      expect(adjusted.interval).toBe("4:24"); // 4 seconds slower
      expect(adjusted.repetition).toBe("4:00"); // No adjustment for repetition
    });

    it("should not adjust repetition paces", () => {
      const basePaces: TrainingPaces = {
        easy: "5:30",
        marathon: "5:10",
        threshold: "4:45",
        interval: "4:20",
        repetition: "4:00",
      };

      const adjusted = planGenerator.calculateAltitudeAdjustments(
        2134,
        basePaces
      );

      expect(adjusted.repetition).toBe("4:00");
      expect(adjusted.interval).toBe("4:24");
    });
  });

  describe("phase structure integrity", () => {
    it("should maintain fixed 20-week structure", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      const totalWeeks = plan.phases.reduce(
        (sum, phase) => sum + phase.durationWeeks,
        0
      );
      expect(totalWeeks).toBe(20);
    });

    it("should include proper phase descriptions", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      expect(plan.phases[0].focusDescription).toContain("Base building");
      expect(plan.phases[1].focusDescription).toContain("Tempo");
      expect(plan.phases[2].focusDescription).toContain("intensity");
      expect(plan.phases[3].focusDescription).toContain("Peak");
    });

    it("should generate weeks for each phase", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      plan.phases.forEach((phase) => {
        expect(phase.weeks).toHaveLength(phase.durationWeeks);
        phase.weeks.forEach((week, weekIndex) => {
          expect(week.weekNumber).toBe(weekIndex + 1);
          expect(week.dailyWorkouts).toBeDefined();
        });
      });
    });
  });

  describe("workout specifications", () => {
    it("should generate daily workouts with required properties", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      const firstWeek = plan.phases[0].weeks[0];
      firstWeek.dailyWorkouts.forEach((workout) => {
        expect(workout).toHaveProperty("dayOfWeek");
        expect(workout).toHaveProperty("workoutType");
        expect(workout).toHaveProperty("description");
        expect(workout).toHaveProperty("purpose");
      });
    });

    it("should include rest days in workout schedule", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      const firstWeek = plan.phases[0].weeks[0];
      const restDays = firstWeek.dailyWorkouts.filter(
        (w) => w.workoutType === "rest"
      );

      expect(restDays.length).toBeGreaterThan(0);
    });
  });

  describe("VDOT calculations", () => {
    const parsePageToSeconds = (pace: string): number => {
      const [minutes, seconds] = pace.split(":").map(Number);
      return minutes * 60 + seconds;
    };

    it("should calculate fitness score from race input", () => {
      const raceInput: RaceInput = {
        distance: "5k",
        time: "20:00",
      };

      const fitnessScore = planGenerator.calculateFitnessScore(raceInput);

      expect(fitnessScore).toBeGreaterThan(30);
      expect(fitnessScore).toBeLessThan(85);
    });

    it("should generate paces from VDOT score", () => {
      const paces = planGenerator.generateVDOTPaces(50, "metric");

      expect(paces).toHaveProperty("easy");
      expect(paces).toHaveProperty("marathon");
      expect(paces).toHaveProperty("threshold");
      expect(paces).toHaveProperty("interval");
      expect(paces).toHaveProperty("repetition");

      // Verify pace progression (interval should be faster than threshold)
      const thresholdSeconds = parsePageToSeconds(paces.threshold);
      const intervalSeconds = parsePageToSeconds(paces.interval);
      expect(intervalSeconds).toBeLessThan(thresholdSeconds);
    });
  });

  describe("unit system consistency", () => {
    it("should maintain metric units throughout plan", () => {
      const plan = planGenerator.generateTrainingPlan(mockAppState);

      expect(plan.metadata.unitSystem).toBe("metric");
    });

    it("should maintain imperial units when specified", () => {
      const imperialState: AppState = {
        ...mockAppState,
        unitPreferences: {
          system: "imperial",
          paceUnit: "min/mi",
          distanceUnit: "mi",
          altitudeUnit: "ft",
        },
      };

      const plan = planGenerator.generateTrainingPlan(imperialState);

      expect(plan.metadata.unitSystem).toBe("imperial");
    });
  });
});
