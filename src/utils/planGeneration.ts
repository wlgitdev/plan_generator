import type {
  FitnessAssessment,
  TrainingConstraints,
  UnitPreferences,
  GeneratedPlan,
  TrainingPacesWithUnits,
  PlanPhase,
  AltitudeAdjustments,
  TrainingPaces,
} from "../types";
import { getTrainingPaces } from "../data/fitnessData";
import { getPlanLevelById } from "../data/planLevels";
import { getGoalRaceById } from "../data/goalRaces";
import { convertPace } from "./unitConversion";
import {
  ALTITUDE_THRESHOLDS,
  isAboveAltitudeThreshold,
} from "./constraintValidation";

/**
 * Generates a complete training plan based on user inputs
 */
export const generateTrainingPlan = (
  fitnessAssessment: FitnessAssessment,
  constraints: TrainingConstraints,
  unitPreferences: UnitPreferences
): GeneratedPlan => {
  const planLevel = getPlanLevelById(fitnessAssessment.selectedPlanLevel);
  if (!planLevel) {
    throw new Error(
      `Invalid plan level: ${fitnessAssessment.selectedPlanLevel}`
    );
  }

  // Calculate training paces
  const trainingPaces = calculateTrainingPaces(
    fitnessAssessment,
    unitPreferences,
    constraints
  );

  // Generate plan structure
  const planStructure = generatePlanStructure(
    fitnessAssessment.selectedPlanLevel,
    constraints.goalRace,
    unitPreferences,
    fitnessAssessment.currentWeeklyMileage
  );

  // Calculate altitude adjustments if needed
  const altitudeAdjustments = calculateAltitudeAdjustments(
    constraints,
    unitPreferences,
    trainingPaces
  );

  return {
    id: generatePlanId(),
    planLevel: fitnessAssessment.selectedPlanLevel,
    fitnessScore: fitnessAssessment.calculatedFitnessScore,
    unitSystem: unitPreferences.system,
    trainingPaces,
    planStructure,
    altitudeAdjustments,
    constraints,
    metadata: generatePlanMetadata(planLevel, unitPreferences, constraints),
  };
};

/**
 * Calculates training paces with unit conversions and descriptions
 */
const calculateTrainingPaces = (
  fitnessAssessment: FitnessAssessment,
  unitPreferences: UnitPreferences,
  constraints: TrainingConstraints
): TrainingPacesWithUnits => {
  let basePaces: TrainingPaces;

  if (fitnessAssessment.calculatedFitnessScore) {
    basePaces =
      getTrainingPaces(fitnessAssessment.calculatedFitnessScore) ||
      getDefaultPaces();
  } else {
    basePaces = estimatePacesFromExperience(fitnessAssessment.experienceLevel);
  }

  // Apply altitude adjustments if needed
  if (
    constraints.trainingAltitude &&
    isAboveAltitudeThreshold(
      constraints.trainingAltitude,
      unitPreferences.system
    )
  ) {
    basePaces = applyAltitudePaceAdjustments(
      basePaces,
      constraints.trainingAltitude,
      unitPreferences.system
    );
  }

  // Convert to user's preferred units if needed
  const convertedPaces = convertPacesToUserUnits(basePaces, unitPreferences);

  return {
    easy: {
      value: convertedPaces.easy,
      unit: unitPreferences.paceUnit,
      description: "Conversational pace for aerobic base building",
      purpose:
        "Develops aerobic capacity and promotes recovery between harder sessions",
    },
    marathon: {
      value: convertedPaces.marathon,
      unit: unitPreferences.paceUnit,
      description: "Comfortably hard race pace for sustained efforts",
      purpose: "Builds race-specific endurance and lactate clearance",
    },
    threshold: {
      value: convertedPaces.threshold,
      unit: unitPreferences.paceUnit,
      description: "Tempo pace for lactate threshold development",
      purpose:
        "Improves lactate threshold and teaches body to clear lactate efficiently",
    },
    interval: {
      value: convertedPaces.interval,
      unit: unitPreferences.paceUnit,
      description: "Hard pace for VO2max development",
      purpose: "Maximizes aerobic power and improves running economy",
    },
    repetition: {
      value: convertedPaces.repetition,
      unit: unitPreferences.paceUnit,
      description: "Very fast pace for speed and neuromuscular development",
      purpose: "Develops speed, running form, and neuromuscular efficiency",
    },
  };
};

/**
 * Generates the 4-phase plan structure with example weeks
 */
const generatePlanStructure = (
  planLevel: string,
  goalRace: string,
  unitPreferences: UnitPreferences,
  currentMileage: number
): PlanPhase[] => {
  const goalRaceData = getGoalRaceById(goalRace);
  const planData = getPlanLevelById(planLevel);

  const baselineWeeklyMileage = Math.max(
    currentMileage,
    planData?.weeklyMileageRange[unitPreferences.system].min || 20
  );

  return [
    {
      id: 1,
      name: "Phase I: Base Building",
      duration: 6,
      focus: "Aerobic base development and injury prevention",
      description:
        "Establish aerobic foundation with easy running and light strides",
      qualitySessions: planLevel === "foundation" ? 0 : 1,
      characteristics: [
        "Primarily easy-paced running",
        "Light strides 2-3 times per week",
        "Focus on consistency and habit formation",
        "Supplemental training introduction",
      ],
      exampleWeek: generateExampleWeek(
        "base",
        planLevel,
        baselineWeeklyMileage,
        unitPreferences
      ),
    },
    {
      id: 2,
      name: "Phase II: Tempo Introduction",
      duration: 5,
      focus: "Introduction of threshold running and light speed work",
      description: "Add tempo runs while maintaining aerobic base",
      qualitySessions: Math.min(2, getQualitySessionsForPlan(planLevel)),
      characteristics: [
        "Tempo runs introduced",
        "Continued easy running emphasis",
        "Light repetition work",
        "Progressive mileage increase",
      ],
      exampleWeek: generateExampleWeek(
        "tempo",
        planLevel,
        baselineWeeklyMileage * 1.1,
        unitPreferences
      ),
    },
    {
      id: 3,
      name: "Phase III: Full Integration",
      duration: 5,
      focus: "All intensity types with maximum training stress",
      description: "Complete intensity spectrum with interval training",
      qualitySessions: getQualitySessionsForPlan(planLevel),
      characteristics: [
        "Interval training at VO2max",
        "Continued tempo work",
        "Peak weekly mileage",
        "Race simulation workouts",
      ],
      exampleWeek: generateExampleWeek(
        "integration",
        planLevel,
        baselineWeeklyMileage * 1.2,
        unitPreferences
      ),
    },
    {
      id: 4,
      name: "Phase IV: Peak & Taper",
      duration: 4,
      focus: "Race preparation and controlled taper",
      description:
        "Maintain fitness while reducing fatigue for peak performance",
      qualitySessions: Math.max(1, getQualitySessionsForPlan(planLevel) - 1),
      characteristics: [
        "Reduced volume with maintained intensity",
        "Race-specific workouts",
        "Emphasis on recovery and freshness",
        "Final preparation and taper",
      ],
      exampleWeek: generateExampleWeek(
        "peak",
        planLevel,
        baselineWeeklyMileage * 0.8,
        unitPreferences
      ),
    },
  ];
};

/**
 * Generates example week for each phase
 */
const generateExampleWeek = (
  phase: "base" | "tempo" | "integration" | "peak",
  planLevel: string,
  weeklyMileage: number,
  unitPreferences: UnitPreferences
) => {
  const unit = unitPreferences.distanceUnit;

  const sessions = {
    base: [
      {
        day: "Sunday",
        type: "long" as const,
        description: `Long run (25% of weekly mileage)`,
        duration: "60-90 min",
        intensity: "Easy",
        purpose: "Aerobic base development",
      },
      {
        day: "Monday",
        type: "easy" as const,
        description: "Easy run + strides",
        duration: "30-45 min",
        intensity: "Easy",
        purpose: "Active recovery",
      },
      {
        day: "Tuesday",
        type: "easy" as const,
        description: "Easy run",
        duration: "30-45 min",
        intensity: "Easy",
        purpose: "Aerobic development",
      },
      {
        day: "Wednesday",
        type: "easy" as const,
        description: "Easy run + strides",
        duration: "30-45 min",
        intensity: "Easy",
        purpose: "Base building",
      },
      {
        day: "Thursday",
        type: "rest" as const,
        description: "Rest or cross-training",
        duration: "0-30 min",
        intensity: "Recovery",
        purpose: "Recovery and adaptation",
      },
      {
        day: "Friday",
        type: "easy" as const,
        description: "Easy run",
        duration: "30-40 min",
        intensity: "Easy",
        purpose: "Preparation for long run",
      },
      {
        day: "Saturday",
        type: "easy" as const,
        description: "Easy run or rest",
        duration: "20-30 min",
        intensity: "Easy",
        purpose: "Active recovery",
      },
    ],
    tempo: [
      {
        day: "Sunday",
        type: "long" as const,
        description: `Long run (25% of weekly mileage)`,
        duration: "75-105 min",
        intensity: "Easy",
        purpose: "Aerobic endurance",
      },
      {
        day: "Monday",
        type: "easy" as const,
        description: "Easy run",
        duration: "30-45 min",
        intensity: "Easy",
        purpose: "Recovery",
      },
      {
        day: "Tuesday",
        type: "quality" as const,
        description: "Tempo run",
        duration: "45-60 min",
        intensity: "Threshold",
        purpose: "Lactate threshold development",
      },
      {
        day: "Wednesday",
        type: "easy" as const,
        description: "Easy run + strides",
        duration: "35-50 min",
        intensity: "Easy",
        purpose: "Recovery between quality",
      },
      {
        day: "Thursday",
        type: "quality" as const,
        description: "Repetition work",
        duration: "40-55 min",
        intensity: "Fast",
        purpose: "Speed and efficiency",
      },
      {
        day: "Friday",
        type: "easy" as const,
        description: "Easy run or rest",
        duration: "25-35 min",
        intensity: "Easy",
        purpose: "Pre-long run recovery",
      },
      {
        day: "Saturday",
        type: "easy" as const,
        description: "Easy run",
        duration: "30-40 min",
        intensity: "Easy",
        purpose: "Active recovery",
      },
    ],
    integration: [
      {
        day: "Sunday",
        type: "long" as const,
        description: `Long run with pickups`,
        duration: "90-120 min",
        intensity: "Easy + Fast",
        purpose: "Endurance with speed practice",
      },
      {
        day: "Monday",
        type: "easy" as const,
        description: "Easy run",
        duration: "40-55 min",
        intensity: "Easy",
        purpose: "Recovery",
      },
      {
        day: "Tuesday",
        type: "quality" as const,
        description: "Interval training",
        duration: "60-75 min",
        intensity: "Hard (VO2max)",
        purpose: "Aerobic power development",
      },
      {
        day: "Wednesday",
        type: "easy" as const,
        description: "Easy run",
        duration: "35-50 min",
        intensity: "Easy",
        purpose: "Active recovery",
      },
      {
        day: "Thursday",
        type: "quality" as const,
        description: "Tempo + repetitions",
        duration: "55-70 min",
        intensity: "Threshold + Fast",
        purpose: "Mixed system development",
      },
      {
        day: "Friday",
        type: "easy" as const,
        description: "Easy run",
        duration: "30-40 min",
        intensity: "Easy",
        purpose: "Recovery",
      },
      {
        day: "Saturday",
        type: "quality" as const,
        description: "Race simulation or tempo",
        duration: "45-60 min",
        intensity: "Race pace",
        purpose: "Race preparation",
      },
    ],
    peak: [
      {
        day: "Sunday",
        type: "long" as const,
        description: `Moderate long run`,
        duration: "60-90 min",
        intensity: "Easy",
        purpose: "Maintain endurance",
      },
      {
        day: "Monday",
        type: "easy" as const,
        description: "Easy run",
        duration: "30-40 min",
        intensity: "Easy",
        purpose: "Active recovery",
      },
      {
        day: "Tuesday",
        type: "quality" as const,
        description: "Race pace + strides",
        duration: "40-50 min",
        intensity: "Race pace",
        purpose: "Race preparation",
      },
      {
        day: "Wednesday",
        type: "easy" as const,
        description: "Easy run or rest",
        duration: "20-35 min",
        intensity: "Easy",
        purpose: "Recovery",
      },
      {
        day: "Thursday",
        type: "quality" as const,
        description: "Short intervals",
        duration: "35-45 min",
        intensity: "Fast",
        purpose: "Maintain sharpness",
      },
      {
        day: "Friday",
        type: "easy" as const,
        description: "Easy run + strides",
        duration: "25-35 min",
        intensity: "Easy",
        purpose: "Race preparation",
      },
      {
        day: "Saturday",
        type: "rest" as const,
        description: "Rest or light jog",
        duration: "0-20 min",
        intensity: "Recovery",
        purpose: "Pre-race recovery",
      },
    ],
  };

  return {
    totalMileage: {
      value: Math.round(weeklyMileage),
      unit,
    },
    sessions: sessions[phase],
  };
};

/**
 * Helper functions
 */
const generatePlanId = (): string => {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getDefaultPaces = (): TrainingPaces => ({
  easy: "7:30",
  marathon: "7:00",
  threshold: "6:20",
  interval: "6:00",
  repetition: "5:45",
});

const estimatePacesFromExperience = (experience: string): TrainingPaces => {
  const paceMap = {
    beginner: {
      easy: "8:30",
      marathon: "8:00",
      threshold: "7:15",
      interval: "6:45",
      repetition: "6:15",
    },
    recreational: {
      easy: "7:30",
      marathon: "7:00",
      threshold: "6:20",
      interval: "6:00",
      repetition: "5:45",
    },
    serious: {
      easy: "6:45",
      marathon: "6:15",
      threshold: "5:35",
      interval: "5:15",
      repetition: "4:55",
    },
    competitive: {
      easy: "6:00",
      marathon: "5:30",
      threshold: "4:55",
      interval: "4:35",
      repetition: "4:15",
    },
  };

  return paceMap[experience as keyof typeof paceMap] || getDefaultPaces();
};

const getQualitySessionsForPlan = (planLevel: string): number => {
  const sessionMap = { foundation: 1, intermediate: 2, advanced: 3, elite: 3 };
  return sessionMap[planLevel as keyof typeof sessionMap] || 2;
};

const convertPacesToUserUnits = (
  paces: TrainingPaces,
  unitPreferences: UnitPreferences
): TrainingPaces => {
  if (unitPreferences.system === "imperial") {
    return paces; // Assuming base paces are in imperial
  }

  // Convert from imperial to metric
  return {
    easy: convertPace(paces.easy, "imperial", "metric"),
    marathon: convertPace(paces.marathon, "imperial", "metric"),
    threshold: convertPace(paces.threshold, "imperial", "metric"),
    interval: convertPace(paces.interval, "imperial", "metric"),
    repetition: convertPace(paces.repetition, "imperial", "metric"),
  };
};

const applyAltitudePaceAdjustments = (
  paces: TrainingPaces,
  altitude: number,
  unitSystem: "metric" | "imperial"
): TrainingPaces => {
  const threshold = ALTITUDE_THRESHOLDS[unitSystem];

  if (altitude < threshold.minimum) {
    return paces;
  }

  // Apply 4-second per 400m adjustment for significant altitude
  const adjustmentSeconds = altitude >= threshold.baseline ? 4 : 2;

  const adjustPace = (paceStr: string, adjustment: number): string => {
    const [min, sec] = paceStr.split(":").map(Number);
    const totalSeconds = min * 60 + sec + adjustment;
    const newMin = Math.floor(totalSeconds / 60);
    const newSec = totalSeconds % 60;
    return `${newMin}:${newSec.toString().padStart(2, "0")}`;
  };

  return {
    easy: adjustPace(paces.easy, adjustmentSeconds),
    marathon: adjustPace(paces.marathon, adjustmentSeconds),
    threshold: adjustPace(paces.threshold, adjustmentSeconds),
    interval: adjustPace(paces.interval, adjustmentSeconds),
    repetition: paces.repetition, // No adjustment for repetition pace
  };
};

const calculateAltitudeAdjustments = (
  constraints: TrainingConstraints,
  unitPreferences: UnitPreferences,
  paces: TrainingPacesWithUnits
): AltitudeAdjustments | undefined => {
  if (
    !constraints.trainingAltitude ||
    !isAboveAltitudeThreshold(
      constraints.trainingAltitude,
      unitPreferences.system
    )
  ) {
    return undefined;
  }

  const threshold = ALTITUDE_THRESHOLDS[unitPreferences.system];
  const adjustmentAmount =
    constraints.trainingAltitude >= threshold.baseline
      ? "4-6 seconds"
      : "2-4 seconds";

  return {
    applied: true,
    altitude: {
      value: constraints.trainingAltitude,
      unit: threshold.unit,
    },
    adjustments: {
      easy: `+${adjustmentAmount} per 400m`,
      marathon: `+${adjustmentAmount} per 400m`,
      threshold: `+${adjustmentAmount} per 400m`,
      interval: `+${adjustmentAmount} per 400m`,
      repetition: "No adjustment",
    },
    explanation: `Training at ${constraints.trainingAltitude.toLocaleString()} ${
      threshold.unit
    } requires pace adjustments to maintain the same physiological effort. These adjustments help account for reduced oxygen availability.`,
  };
};

const generatePlanMetadata = (
  planLevel: any,
  unitPreferences: UnitPreferences,
  constraints: TrainingConstraints
) => {
  const range = planLevel.weeklyMileageRange[unitPreferences.system];
  const trainingDays = constraints.availableTrainingDays.filter(Boolean).length;
  const sessionDuration = constraints.sessionDuration;

  return {
    generatedAt: new Date(),
    totalWeeks: 20,
    weeklyMileageRange: {
      min: range.min,
      max: range.max,
      unit: range.unit,
    },
    estimatedTimeCommitment: `${trainingDays} sessions/week, ${sessionDuration} min/session`,
    progressionPrinciples: [
      "Progressive overload with 10% weekly increase maximum",
      "Periodized approach through 4 distinct phases",
      "80/20 easy-to-hard training distribution",
      "Recovery weeks every 4th week",
    ],
  };
};
