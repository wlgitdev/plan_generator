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
    metric: { min: number, max: number, unit: string },
    imperial: { min: number, max: number, unit: string },
  };
  qualitySessions: number;
  trainingDays: string;
  description: string;
  suitableFor: string[];
  exampleDistances: {
    metric: { value: number, unit: string, description: string }[],
    imperial: { value: number, unit: string, description: string }[],
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

export interface ExperienceLevel {
  id: "beginner" | "recreational" | "serious" | "competitive";
  name: string;
  description: string;
  weeklyMileageRange: {
    metric: { min: number, max: number },
    imperial: { min: number, max: number },
  };
  recommendedPlan: string;
  trainingDays: string;
  characteristics: string[];
}

export interface RaceDistance {
  id: string;
  name: string;
  distance: {
    metric: { value: number, unit: string },
    imperial: { value: number, unit: string },
  };
  timeFormat: "MM:SS" | "H:MM:SS";
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
}

export interface ConversionFactors {
  kmToMiles: number;
  milesToKm: number;
  metersToFeet: number;
  feetToMeters: number;
  paceKmToMile: number;
  paceMileToKm: number;
}
