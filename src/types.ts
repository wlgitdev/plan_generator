export type UnitSystem = "metric" | "imperial";

export interface UnitPreferences {
  system: UnitSystem;
  paceUnit: string;
  distanceUnit: string;
  altitudeUnit: string;
}

export interface PlanLevel {
  id: string;
  name: string;
  targetGroup: string;
  weeklyMileageRange: {
    metric: { min: number; max: number; unit: string };
    imperial: { min: number; max: number; unit: string };
  };
  qualitySessions: number;
  trainingDays: string;
  description: string;
  suitableFor: string[];
  exampleDistances: {
    metric: { value: number; unit: string; description: string }[];
    imperial: { value: number; unit: string; description: string }[];
  };
}

export interface RaceInput {
  distance: string;
  time: string;
}

export interface FitnessAssessment {
  experienceLevel: "beginner" | "recreational" | "serious" | "competitive";
  currentWeeklyMileage: number;
  raceInput?: RaceInput;
  calculatedFitnessScore?: number;
  recommendedPlanLevel: string;
  selectedPlanLevel: string;
}

export interface TrainingConstraints {
  availableTrainingDays: boolean[]; // 7 days, index 0 = Sunday
  sessionDuration: number; // minutes
  goalRace: string; // race distance ID
  trainingAltitude?: number; // in user's preferred units
}

export interface ExperienceLevel {
  id: "beginner" | "recreational" | "serious" | "competitive";
  name: string;
  description: string;
  weeklyMileageRange: {
    metric: { min: number; max: number };
    imperial: { min: number; max: number };
  };
  recommendedPlan: string;
  trainingDays: string;
  characteristics: string[];
}

export interface RaceDistance {
  id: string;
  name: string;
  distance: {
    metric: { value: number; unit: string };
    imperial: { value: number; unit: string };
  };
  timeFormat: "MM:SS" | "H:MM:SS";
}

export interface GoalRace {
  id: string;
  name: string;
  distance: {
    metric: { value: number; unit: string };
    imperial: { value: number; unit: string };
  };
  description: string;
  focusAreas: string[];
  typicalDuration: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
}

// VDOT Map Types
export interface RaceTimes {
  "5K": string;
  "10K": string;
  "Half Marathon": string;
  Marathon: string;
}

export interface TrainingPaces {
  easy: string;
  marathon: string;
  threshold: string;
  interval: string;
  repetition: string;
}

export interface VDOTMap {
  raceTimes: Record<string, RaceTimes>;
  paces: Record<string, TrainingPaces>;
}

export interface AppState {
  currentScreen:
    | "landing"
    | "preferences"
    | "assessment"
    | "constraints"
    | "generation"
    | "export";
  unitPreferences: UnitPreferences;
  fitnessAssessment?: FitnessAssessment;
  trainingConstraints?: TrainingConstraints;
}

export interface ConversionFactors {
  kmToMiles: number;
  milesToKm: number;
  metersToFeet: number;
  feetToMeters: number;
  paceKmToMile: number;
  paceMileToKm: number;
}

export interface ConstraintValidation {
  isValid: boolean;
  warnings: string[];
  compatibility: {
    withPlanLevel: boolean;
    withExperience: boolean;
    withGoalRace: boolean;
  };
}

export interface GeneratedPlan {
  id: string;
  planLevel: string;
  fitnessScore?: number;
  unitSystem: UnitSystem;
  trainingPaces: TrainingPacesWithUnits;
  planStructure: PlanPhase[];
  altitudeAdjustments?: AltitudeAdjustments;
  constraints: TrainingConstraints;
  metadata: PlanMetadata;
}

export interface TrainingPacesWithUnits {
  easy: {
    value: string;
    unit: string;
    description: string;
    purpose: string;
  };
  marathon: {
    value: string;
    unit: string;
    description: string;
    purpose: string;
  };
  threshold: {
    value: string;
    unit: string;
    description: string;
    purpose: string;
  };
  interval: {
    value: string;
    unit: string;
    description: string;
    purpose: string;
  };
  repetition: {
    value: string;
    unit: string;
    description: string;
    purpose: string;
  };
}

export interface PlanPhase {
  id: number;
  name: string;
  duration: number; // weeks
  focus: string;
  description: string;
  qualitySessions: number;
  characteristics: string[];
  exampleWeek: ExampleWeek;
}

export interface ExampleWeek {
  totalMileage: {
    value: number;
    unit: string;
  };
  sessions: ExampleSession[];
}

export interface ExampleSession {
  day: string;
  type: "easy" | "long" | "quality" | "rest";
  description: string;
  duration?: string;
  intensity?: string;
  purpose: string;
}

export interface AltitudeAdjustments {
  applied: boolean;
  altitude: {
    value: number;
    unit: string;
  };
  adjustments: {
    easy: string;
    marathon: string;
    threshold: string;
    interval: string;
    repetition: string;
  };
  explanation: string;
}

export interface PlanMetadata {
  generatedAt: Date;
  totalWeeks: number;
  weeklyMileageRange: {
    min: number;
    max: number;
    unit: string;
  };
  estimatedTimeCommitment: string;
  progressionPrinciples: string[];
}