// types.ts
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

export interface AppState {
  currentScreen:
    | "landing"
    | "preferences"
    | "assessment"
    | "constraints"
    | "generation"
    | "export";
  unitPreferences: UnitPreferences;
}

export interface ConversionFactors {
  kmToMiles: number;
  milesToKm: number;
  metersToFeet: number;
  feetToMeters: number;
  paceKmToMile: number;
  paceMileToKm: number;
}
