import type {
  TrainingConstraints,
  ConstraintValidation,
  UnitSystem,
  FitnessAssessment,
} from "../types";
import {
  getSessionDurationRange,
  getMinTrainingDays,
  getGoalRaceById,
} from "../data/goalRaces";
import { convertDistance } from "./unitConversion";

/**
 * Altitude thresholds for pace adjustments
 * Based on TR-003 requirements for altitude adjustment engine
 */
export const ALTITUDE_THRESHOLDS = {
  metric: {
    minimum: 914, // 3,000 feet in meters
    baseline: 2134, // 7,000 feet baseline
    unit: "m",
  },
  imperial: {
    minimum: 3000, // 3,000 feet
    baseline: 7000, // 7,000 feet baseline
    unit: "ft",
  },
} as const;

/**
 * Validates training constraints against plan level and fitness assessment
 */
export const validateTrainingConstraints = (
  constraints: TrainingConstraints,
  planLevel: string,
  unitSystem: UnitSystem,
  fitnessAssessment?: FitnessAssessment
): ConstraintValidation => {
  const warnings: string[] = [];
  let planCompatible = true;
  let experienceCompatible = true;
  let goalRaceCompatible = true;

  // Validate training days
  const selectedDays = constraints.availableTrainingDays.filter(Boolean).length;
  const minDays = getMinTrainingDays(planLevel);

  if (selectedDays < minDays) {
    warnings.push(
      `The ${planLevel} plan typically requires ${minDays}+ training days, but you've selected ${selectedDays}. Consider adding more training days or selecting a lower intensity plan.`
    );
    planCompatible = false;
  }

  if (selectedDays < 3) {
    warnings.push(
      "A minimum of 3 training days per week is recommended for effective progress and injury prevention."
    );
    planCompatible = false;
  }

  // Validate session duration
  const durationRange = getSessionDurationRange(planLevel);
  if (constraints.sessionDuration < durationRange.min) {
    warnings.push(
      `Your session duration (${constraints.sessionDuration} min) is below the typical range for ${planLevel} plan (${durationRange.min}-${durationRange.max} min). Longer sessions may be needed for effective training.`
    );
    planCompatible = false;
  }

  if (constraints.sessionDuration > durationRange.max * 1.5) {
    warnings.push(
      `Your session duration (${constraints.sessionDuration} min) is significantly above the typical range. Consider whether this is sustainable long-term.`
    );
  }

  // Validate goal race compatibility
  const goalRace = getGoalRaceById(constraints.goalRace);
  if (goalRace) {
    // Check if goal race aligns with plan level capabilities
    if (
      planLevel === "foundation" &&
      (constraints.goalRace === "Marathon" || constraints.goalRace === "Ultra")
    ) {
      warnings.push(
        `The ${goalRace.name} is an ambitious goal for the Foundation plan. Consider the Intermediate plan for better preparation.`
      );
      goalRaceCompatible = false;
    }

    if (
      planLevel === "elite" &&
      constraints.goalRace === "5K" &&
      selectedDays < 6
    ) {
      warnings.push(
        "Elite-level 5K training typically benefits from 6-7 training days per week for optimal speed development."
      );
    }
  }

  // Validate altitude considerations
  if (constraints.trainingAltitude !== undefined) {
    const threshold = ALTITUDE_THRESHOLDS[unitSystem];
    if (constraints.trainingAltitude >= threshold.minimum) {
      const altitudeWarning = generateAltitudeWarning(
        constraints.trainingAltitude,
        unitSystem
      );
      if (altitudeWarning) {
        warnings.push(altitudeWarning);
      }
    }
  }

  // Validate experience compatibility
  if (fitnessAssessment) {
    const experienceWarnings = validateExperienceCompatibility(
      constraints,
      fitnessAssessment,
      planLevel
    );
    warnings.push(...experienceWarnings);

    if (experienceWarnings.length > 0) {
      experienceCompatible = false;
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    compatibility: {
      withPlanLevel: planCompatible,
      withExperience: experienceCompatible,
      withGoalRace: goalRaceCompatible,
    },
  };
};

/**
 * Generates altitude-specific warnings and adjustments
 */
export const generateAltitudeWarning = (
  altitude: number,
  unitSystem: UnitSystem
): string | null => {
  const threshold = ALTITUDE_THRESHOLDS[unitSystem];

  if (altitude < threshold.minimum) {
    return null;
  }

  const unit = threshold.unit;

  if (altitude >= threshold.baseline) {
    return `Training at ${altitude.toLocaleString()} ${unit} will require pace adjustments. At this altitude, training paces should be 4-6 seconds per 400m slower than sea level to maintain the same physiological effort.`;
  }

  return `Training at ${altitude.toLocaleString()} ${unit} may affect performance. Consider pace adjustments for intense sessions, especially above ${threshold.baseline.toLocaleString()} ${unit}.`;
};

/**
 * Checks altitude threshold in user's preferred units
 */
export const isAboveAltitudeThreshold = (
  altitude: number,
  unitSystem: UnitSystem
): boolean => {
  const threshold = ALTITUDE_THRESHOLDS[unitSystem].minimum;
  return altitude >= threshold;
};

/**
 * Converts altitude between unit systems for validation
 */
export const convertAltitude = (
  altitude: number,
  fromSystem: UnitSystem,
  toSystem: UnitSystem
): number => {
  if (fromSystem === toSystem) return altitude;

  if (fromSystem === "metric" && toSystem === "imperial") {
    return convertDistance(altitude, "m", "ft");
  }

  if (fromSystem === "imperial" && toSystem === "metric") {
    return convertDistance(altitude, "ft", "m");
  }

  return altitude;
};

/**
 * Validates constraints against fitness assessment and experience level
 */
const validateExperienceCompatibility = (
  constraints: TrainingConstraints,
  fitnessAssessment: FitnessAssessment,
  planLevel: string
): string[] => {
  const warnings: string[] = [];
  const { experienceLevel } = fitnessAssessment;

  // Check if training frequency matches experience
  const selectedDays = constraints.availableTrainingDays.filter(Boolean).length;

  if (experienceLevel === "beginner" && selectedDays > 4) {
    warnings.push(
      "As a beginner, starting with 3-4 training days may be more sustainable than 5+ days per week."
    );
  }

  if (experienceLevel === "competitive" && selectedDays < 5) {
    warnings.push(
      "Competitive-level goals typically require 5-7 training days per week for optimal adaptation."
    );
  }

  // Check session duration against experience
  if (experienceLevel === "beginner" && constraints.sessionDuration > 90) {
    warnings.push(
      "Long sessions (90+ minutes) may be challenging for beginners. Consider shorter, more frequent sessions initially."
    );
  }

  return warnings;
};

/**
 * Gets recommended session duration based on plan level and goal race
 */
export const getRecommendedSessionDuration = (
  planLevel: string,
  goalRace: string
): number => {
  const baseRange = getSessionDurationRange(planLevel);

  // Adjust based on goal race requirements
  const goalRaceData = getGoalRaceById(goalRace);
  if (!goalRaceData) return baseRange.optimal;

  switch (goalRace) {
    case "5K":
    case "10K":
      // Shorter races can use shorter sessions
      return Math.max(baseRange.min, baseRange.optimal - 15);

    case "Marathon":
    case "Ultra":
      // Longer races benefit from longer sessions
      return Math.min(baseRange.max, baseRange.optimal + 15);

    default:
      return baseRange.optimal;
  }
};

/**
 * Formats constraint impact summary for display
 */
export const formatConstraintImpact = (
  constraints: TrainingConstraints,
  planLevel: string,
  unitSystem: UnitSystem
): string[] => {
  const impacts: string[] = [];
  const selectedDays = constraints.availableTrainingDays.filter(Boolean).length;
  const goalRace = getGoalRaceById(constraints.goalRace);

  impacts.push(
    `Training ${selectedDays} days per week with ${constraints.sessionDuration}-minute sessions`
  );

  if (goalRace) {
    impacts.push(`Optimized for ${goalRace.name} performance`);
    impacts.push(...goalRace.focusAreas.slice(0, 2));
  }

  if (
    constraints.trainingAltitude &&
    isAboveAltitudeThreshold(constraints.trainingAltitude, unitSystem)
  ) {
    const unit = ALTITUDE_THRESHOLDS[unitSystem].unit;
    impacts.push(
      `Altitude-adjusted training paces for ${constraints.trainingAltitude.toLocaleString()} ${unit}`
    );
  }

  return impacts;
};
