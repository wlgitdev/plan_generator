import type { GoalRace } from "../types";

/**
 * Available goal race distances with training focus areas and descriptions
 * Based on FR-011 requirements for goal race capture with distance-specific modifications
 */
export const GOAL_RACES: GoalRace[] = [
  {
    id: "5K",
    name: "5K",
    distance: {
      metric: { value: 5, unit: "km" },
      imperial: { value: 3.1, unit: "mi" },
    },
    description: "Fast-paced race requiring speed and anaerobic capacity",
    focusAreas: [
      "High speed work frequency",
      "Track-based interval training",
      "Moderate weekly mileage",
      "Lactate threshold development",
    ],
    typicalDuration: {
      beginner: "30-35 min",
      intermediate: "22-28 min",
      advanced: "18-22 min",
    },
  },
  {
    id: "10K",
    name: "10K",
    distance: {
      metric: { value: 10, unit: "km" },
      imperial: { value: 6.2, unit: "mi" },
    },
    description: "Balanced race combining speed endurance with aerobic power",
    focusAreas: [
      "Balanced tempo and marathon pace work",
      "Moderate-high weekly mileage",
      "VO2max interval training",
      "Race-specific pace practice",
    ],
    typicalDuration: {
      beginner: "60-70 min",
      intermediate: "45-55 min",
      advanced: "35-45 min",
    },
  },
  {
    id: "Half Marathon",
    name: "Half Marathon",
    distance: {
      metric: { value: 21.1, unit: "km" },
      imperial: { value: 13.1, unit: "mi" },
    },
    description: "Demanding endurance race emphasizing lactate threshold",
    focusAreas: [
      "Extensive tempo training",
      "Progressive long runs",
      "High weekly mileage",
      "Marathon pace integration",
    ],
    typicalDuration: {
      beginner: "2:30-3:00",
      intermediate: "1:50-2:15",
      advanced: "1:20-1:50",
    },
  },
  {
    id: "Marathon",
    name: "Marathon",
    distance: {
      metric: { value: 42.2, unit: "km" },
      imperial: { value: 26.2, unit: "mi" },
    },
    description: "Ultimate endurance challenge requiring high aerobic capacity",
    focusAreas: [
      "High mileage priority",
      "Long run emphasis (up to 3+ hours)",
      "Marathon pace focus",
      "Fueling and pacing strategies",
    ],
    typicalDuration: {
      beginner: "5:00-6:00",
      intermediate: "3:45-4:30",
      advanced: "2:45-3:30",
    },
  },
  {
    id: "Ultra",
    name: "Ultra Marathon",
    distance: {
      metric: { value: 50, unit: "km" },
      imperial: { value: 31, unit: "mi" },
    },
    description: "Extended endurance event focusing on time on feet",
    focusAreas: [
      "Very high weekly mileage",
      "Back-to-back long runs",
      "Fueling and hydration practice",
      "Mental endurance training",
    ],
    typicalDuration: {
      beginner: "6:00-8:00",
      intermediate: "4:30-5:30",
      advanced: "3:30-4:15",
    },
  },
];

/**
 * Session duration ranges by plan level (in minutes)
 * Used for plan compatibility checking
 */
export const SESSION_DURATION_RANGES = {
  foundation: { min: 30, max: 75, optimal: 45 },
  intermediate: { min: 45, max: 105, optimal: 75 },
  advanced: { min: 60, max: 135, optimal: 90 },
  elite: { min: 75, max: 180, optimal: 120 },
} as const;

/**
 * Minimum training days by plan level
 */
export const MIN_TRAINING_DAYS = {
  foundation: 3,
  intermediate: 4,
  advanced: 5,
  elite: 6,
} as const;

/**
 * Gets goal race by ID with type safety
 */
export const getGoalRaceById = (id: string): GoalRace | undefined => {
  return GOAL_RACES.find((race) => race.id === id);
};

/**
 * Gets all goal race IDs for validation purposes
 */
export const getAllGoalRaceIds = (): string[] => {
  return GOAL_RACES.map((race) => race.id);
};

/**
 * Gets session duration range for a plan level
 */
export const getSessionDurationRange = (planLevel: string) => {
  return (
    SESSION_DURATION_RANGES[
      planLevel as keyof typeof SESSION_DURATION_RANGES
    ] || SESSION_DURATION_RANGES.foundation
  );
};

/**
 * Gets minimum training days for a plan level
 */
export const getMinTrainingDays = (planLevel: string): number => {
  return MIN_TRAINING_DAYS[planLevel as keyof typeof MIN_TRAINING_DAYS] || 3;
};
